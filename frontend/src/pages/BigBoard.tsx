import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GripVertical, User } from "lucide-react";
import type { PlayerBio } from "../types/bio";
import type { ScoutRanking } from "../types/scoutRankings";
import { ScoutRankingUtils } from "../types/scoutRankings";
import { PlayerBioUtils } from "../types/bio";
import draftDataJson from "../data/draftData.json";
import "../css/BigBoard.css";

interface BigBoardPlayer {
  id: number;
  rank: number;
  name: string;
  photoUrl: string;
  team: string;
  league: string;
  height: number;
  weight: number;
  position?: string;
  consensusRank: number;
  scoutRanking?: ScoutRanking; // Add scout ranking data
}

interface DraftData {
  bio: PlayerBio[];
  scoutRankings: ScoutRanking[];
}

// localStorage key for saving rankings
const RANKINGS_STORAGE_KEY = "mavs-draft-board-rankings";

export default function BigBoard() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<BigBoardPlayer[]>([]);
  const [draggedPlayer, setDraggedPlayer] = useState<BigBoardPlayer | null>(
    null
  );
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Save current rankings to localStorage
  const saveRankingsToStorage = (playersToSave: BigBoardPlayer[]) => {
    try {
      const rankingsData = playersToSave.map((player) => ({
        id: player.id,
        rank: player.rank,
      }));
      localStorage.setItem(RANKINGS_STORAGE_KEY, JSON.stringify(rankingsData));
      console.log("Rankings saved to localStorage:", rankingsData);
    } catch (error) {
      console.error("Error saving rankings to localStorage:", error);
    }
  };

  // Load saved rankings from localStorage
  const loadSavedRankings = (): { [playerId: number]: number } => {
    try {
      const savedData = localStorage.getItem(RANKINGS_STORAGE_KEY);
      if (savedData) {
        const rankings = JSON.parse(savedData);
        const rankingMap: { [playerId: number]: number } = {};

        rankings.forEach((item: { id: number; rank: number }) => {
          rankingMap[item.id] = item.rank;
        });

        console.log("Loaded saved rankings:", rankingMap);
        return rankingMap;
      }
    } catch (error) {
      console.error("Error loading saved rankings:", error);
    }
    return {};
  };

  // Load data from JSON file
  useEffect(() => {
    const loadDraftData = () => {
      try {
        console.log("Loading draft data from imported JSON...");
        const data: DraftData = draftDataJson as DraftData;
        console.log("Loaded data:", data);

        // Check if data has the expected structure
        if (!data.bio || !Array.isArray(data.bio)) {
          throw new Error("Invalid data structure: bio array not found");
        }

        if (!data.scoutRankings || !Array.isArray(data.scoutRankings)) {
          console.warn("Scout rankings not found, using bio data only");
        }

        // Load any saved custom rankings
        const savedRankings = loadSavedRankings();
        const hasSavedRankings = Object.keys(savedRankings).length > 0;

        // Combine bio and ranking data
        const bigBoardPlayers: BigBoardPlayer[] = data.bio
          .map((player, index) => {
            // Find corresponding scout rankings
            const rankings = data.scoutRankings?.find(
              (r) => r.playerId === player.playerId
            );
            const consensusRank = rankings
              ? ScoutRankingUtils.getConsensusRank(rankings)
              : index + 1;

            console.log(
              `Processing player: ${player.name}, consensusRank: ${consensusRank}`
            );

            return {
              id: player.playerId,
              rank: savedRankings[player.playerId] || consensusRank,
              name: player.name,
              photoUrl: player.photoUrl,
              team: player.currentTeam,
              league: player.league,
              height: player.height,
              weight: player.weight,
              position: undefined, 
              consensusRank, 
              scoutRanking: rankings, 
            };
          })
          .filter((player) => {
            // Only filter if we're using consensus rankings and no saved rankings exist
            if (Object.keys(savedRankings).length === 0) {
              return player.scoutRanking ? player.consensusRank > 0 : true;
            }
            return true;
          })
          // Sort with proper tiebreaker logic
          .sort((a, b) => {
            // If we have saved rankings, sort by those
            if (Object.keys(savedRankings).length > 0) {
              return a.rank - b.rank;
            }

            // Otherwise, sort by consensus with tiebreaker logic
            if (a.consensusRank !== b.consensusRank) {
              return a.consensusRank - b.consensusRank;
            }

            // Tiebreaker: by decimal average when consensus ranks are the same
            if (a.scoutRanking && b.scoutRanking) {
              const aDecimalAverage = ScoutRankingUtils.getAverageRank(
                a.scoutRanking
              );
              const bDecimalAverage = ScoutRankingUtils.getAverageRank(
                b.scoutRanking
              );
              return aDecimalAverage - bDecimalAverage;
            }

            // Maintain original order
            return 0;
          })
          // Ensure ranks are sequential
          .map((player, index) => ({
            ...player,
            rank: index + 1,
          }));

        console.log("Final players array:", bigBoardPlayers);

        // If we loaded saved rankings, re-save to ensure consistency
        if (hasSavedRankings) {
          console.log("Re-saving rankings to ensure consistency");
          saveRankingsToStorage(bigBoardPlayers);
        }

        setPlayers(bigBoardPlayers);
        setLoading(false);
      } catch (error) {
        console.error("Error loading draft data:", error);
        setLoading(false);
      }
    };

    loadDraftData();
  }, []);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    player: BigBoardPlayer
  ) => {
    setDraggedPlayer(player);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("bigboard-row-dragging");
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedPlayer(null);
    setDragOverIndex(null);
    e.currentTarget.classList.remove("bigboard-row-dragging");
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    dropIndex: number
  ) => {
    e.preventDefault();

    if (!draggedPlayer) return;

    const draggedIndex = players.findIndex((p) => p.id === draggedPlayer.id);
    if (draggedIndex === dropIndex) return;

    // Create new array with reordered players
    const newPlayers = [...players];
    const [removed] = newPlayers.splice(draggedIndex, 1);
    newPlayers.splice(dropIndex, 0, removed);

    // Update ranks to be sequential
    const updatedPlayers = newPlayers.map((player, index) => ({
      ...player,
      rank: index + 1,
    }));

    console.log("Player moved:", {
      player: draggedPlayer.name,
      from: draggedIndex + 1,
      to: dropIndex + 1,
    });

    // Update state
    setPlayers(updatedPlayers);
    setDragOverIndex(null);

    // Save the new rankings to localStorage
    saveRankingsToStorage(updatedPlayers);
  };

  const handlePlayerClick = (player: BigBoardPlayer, e: React.MouseEvent) => {
    // Prevent navigation if dragging
    if (e.defaultPrevented) return;

    navigate(`/player-profile/${player.id}`);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none";
    e.currentTarget.nextElementSibling?.classList.remove("hidden");
  };

  // Function to reset rankings (useful for testing or admin purposes)
  const resetRankings = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all custom rankings? This will restore the original consensus rankings."
      )
    ) {
      localStorage.removeItem(RANKINGS_STORAGE_KEY);
      window.location.reload(); // Reload to get original rankings
    }
  };

  if (loading) {
    return (
      <div className="bigboard-container">
        <div className="bigboard-header">
          <h1>Dallas Mavericks Big Board</h1>
          <p>Loading prospects...</p>
        </div>
        <div className="bigboard-loading">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="bigboard-row-skeleton">
              <div className="bigboard-rank-skeleton"></div>
              <div className="bigboard-photo-skeleton"></div>
              <div className="bigboard-info-skeleton">
                <div className="bigboard-name-skeleton"></div>
                <div className="bigboard-team-skeleton"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="bigboard-container">
        <div className="bigboard-header">
          <h1>Dallas Mavericks Big Board</h1>
          <p>No players found</p>
        </div>
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "white",
            borderRadius: "1rem",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <h3>Debug Information:</h3>
          <p>Check the browser console for error messages.</p>
          <p>
            Make sure your JSON file is located at:{" "}
            <code>src/data/draftData.json</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bigboard-container">
      <div className="bigboard-header">
        <h1>Dallas Mavericks Big Board</h1>
        <p>Drag and drop to edit the Big Board</p>
      </div>

      <div className="bigboard-list">
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`bigboard-row ${dragOverIndex === index ? "bigboard-row-drag-over" : ""}`}
            draggable
            onDragStart={(e) => handleDragStart(e, player)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onClick={(e) => handlePlayerClick(player, e)}
          >
            <div className="bigboard-drag-handle">
              <GripVertical size={20} />
            </div>

            <div className="bigboard-rank">
              <span className="bigboard-rank-number">{player.rank}</span>
            </div>

            <div className="bigboard-photo">
              <img
                src={player.photoUrl}
                alt={player.name}
                onError={handleImageError}
              />
              <div className="bigboard-photo-placeholder hidden">
                <User size={32} />
              </div>
            </div>

            <div className="bigboard-info">
              <h3 className="bigboard-name">{player.name}</h3>
              <div className="bigboard-details">
                <span className="bigboard-team">{player.team}</span>
                <span className="bigboard-separator">•</span>
                <span className="bigboard-league">{player.league}</span>
                <span className="bigboard-separator">•</span>
                <span className="bigboard-measurements">
                  {PlayerBioUtils.formatHeight(player.height)} • {player.weight}{" "}
                  lbs
                </span>
                {player.position && (
                  <>
                    <span className="bigboard-separator">•</span>
                    <span className="bigboard-position">{player.position}</span>
                  </>
                )}
              </div>
            </div>

            {player.scoutRanking && (
              <div className="bigboard-consensus-info">
                <div className="bigboard-consensus-rank">
                  <span className="bigboard-consensus-label">Consensus</span>
                  <span className="bigboard-consensus-value">#{index + 1}</span>
                </div>
                <div className="bigboard-range">
                  <span className="bigboard-range-label">Range</span>
                  <span className="bigboard-range-value">
                    {
                      ScoutRankingUtils.getRankingSpread(player.scoutRanking)
                        .min
                    }
                    -
                    {
                      ScoutRankingUtils.getRankingSpread(player.scoutRanking)
                        .max
                    }
                  </span>
                </div>
              </div>
            )}

            <div className="bigboard-actions">
              <span className="bigboard-view-hint">Click to view profile</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bigboard-footer">
        <p>Rankings last updated: {new Date().toLocaleDateString()}</p>
        <p>Drag players to reorder • Click to view detailed profile</p>
        <p>
          <small>
            Custom rankings are saved in your browser and will persist across
            sessions
          </small>
        </p>
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <button
            onClick={resetRankings}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#dc2626")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#ef4444")}
          >
            Reset Big Board
          </button>
        </div>
      </div>
    </div>
  );
}
