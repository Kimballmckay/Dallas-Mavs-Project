import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Trophy, TrendingUp } from "lucide-react";
import type { PlayerBio } from "../types/bio";
import type { ScoutRanking } from "../types/scoutRankings";
import { ScoutRankingUtils } from "../types/scoutRankings";
import { PlayerBioUtils } from "../types/bio";
import draftDataJson from "../data/draftData.json";
import "../css/ScoutRankings.css";

interface ScoutRankingData {
  bio: PlayerBio;
  ranking: ScoutRanking;
  scoutRank: number;
}

interface DraftData {
  bio: PlayerBio[];
  scoutRankings?: ScoutRanking[];
}

type ScoutName =
  | "ESPN Rank"
  | "Sam Vecenie Rank"
  | "Kevin O'Connor Rank"
  | "Kyle Boone Rank"
  | "Gary Parrish Rank"
  | "Consensus";

export default function ScoutRankings() {
  const navigate = useNavigate();
  const [rankingsData, setRankingsData] = useState<ScoutRankingData[]>([]);
  const [filteredRankings, setFilteredRankings] = useState<ScoutRankingData[]>(
    []
  );
  const [activeScout, setActiveScout] = useState<ScoutName>("Consensus");
  const [loading, setLoading] = useState(true);

  const scoutTabs: { name: ScoutName; label: string; icon: typeof Trophy }[] = [
    { name: "Consensus", label: "Consensus", icon: Trophy },
    { name: "ESPN Rank", label: "ESPN", icon: TrendingUp },
    { name: "Sam Vecenie Rank", label: "Sam Vecenie", icon: TrendingUp },
    { name: "Kevin O'Connor Rank", label: "Kevin O'Connor", icon: TrendingUp },
    { name: "Kyle Boone Rank", label: "Kyle Boone", icon: TrendingUp },
    { name: "Gary Parrish Rank", label: "Gary Parrish", icon: TrendingUp },
  ];

  // Load and process data
  useEffect(() => {
    const loadScoutingData = () => {
      try {
        const data: DraftData = draftDataJson as DraftData;

        if (!data.bio || !Array.isArray(data.bio)) {
          throw new Error("Invalid data structure: bio array not found");
        }

        if (!data.scoutRankings || !Array.isArray(data.scoutRankings)) {
          throw new Error(
            "Invalid data structure: scoutRankings array not found"
          );
        }

        // Combine bio and ranking data
        const combinedData: ScoutRankingData[] = data.bio
          .map((player) => {
            const ranking = data.scoutRankings?.find(
              (r) => r.playerId === player.playerId
            );

            if (!ranking) return null;

            return {
              bio: player,
              ranking: ranking,
              scoutRank: ScoutRankingUtils.getConsensusRank(ranking), // Will be updated per scout
            };
          })
          .filter((item): item is ScoutRankingData => item !== null);

        setRankingsData(combinedData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading scouting data:", error);
        setLoading(false);
      }
    };

    loadScoutingData();
  }, []);

  // Filter and sort rankings based on active scout
  useEffect(() => {
    if (rankingsData.length === 0) return;

    const processedData = rankingsData
      .map((item) => {
        let scoutRank: number;

        if (activeScout === "Consensus") {
          scoutRank = ScoutRankingUtils.getConsensusRank(item.ranking);
        } else {
          scoutRank = ScoutRankingUtils.getRankByScout(
            item.ranking,
            activeScout as keyof ScoutRanking
          );
        }

        return {
          ...item,
          scoutRank,
        };
      })
      // Filter out players with no ranking (rank 0 or invalid)
      .filter((item) => item.scoutRank > 0)
      // Sort by scout's ranking, with special tiebreaker logic for Consensus tab
      .sort((a, b) => {
        if (activeScout === "Consensus") {
          // For Consensus tab: Primary sort by rounded consensus rank,
          // tiebreaker by decimal average (lower decimal wins)
          if (a.scoutRank !== b.scoutRank) {
            return a.scoutRank - b.scoutRank;
          }
          // Tiebreaker: by decimal average when consensus ranks are the same
          const aDecimalAverage = ScoutRankingUtils.getAverageRank(a.ranking);
          const bDecimalAverage = ScoutRankingUtils.getAverageRank(b.ranking);
          return aDecimalAverage - bDecimalAverage;
        } else {
          // For individual scout tabs: just sort by that scout's ranking
          return a.scoutRank - b.scoutRank;
        }
      });

    setFilteredRankings(processedData);
  }, [rankingsData, activeScout]);

  const handlePlayerClick = (playerId: number) => {
    navigate(`/player-profile/${playerId}`);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none";
    e.currentTarget.nextElementSibling?.classList.remove("hidden");
  };

  if (loading) {
    return (
      <div className="scout-rankings-container">
        <div className="scout-rankings-header">
          <h1>Scout Rankings</h1>
          <p>Loading scout rankings...</p>
        </div>
        <div className="scout-rankings-loading">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="scout-rankings-row-skeleton">
              <div className="scout-rankings-rank-skeleton"></div>
              <div className="scout-rankings-photo-skeleton"></div>
              <div className="scout-rankings-info-skeleton">
                <div className="scout-rankings-name-skeleton"></div>
                <div className="scout-rankings-team-skeleton"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="scout-rankings-container">
      <div className="scout-rankings-header">
        <h1>Scout Rankings</h1>
      </div>

      {/* Scout Tabs */}
      <div className="scout-rankings-tabs">
        {scoutTabs.map((scout) => {
          const Icon = scout.icon;
          const isActive = activeScout === scout.name;
          const playerCount = rankingsData.filter((item) => {
            const rank =
              scout.name === "Consensus"
                ? ScoutRankingUtils.getConsensusRank(item.ranking)
                : ScoutRankingUtils.getRankByScout(
                    item.ranking,
                    scout.name as keyof ScoutRanking
                  );
            return rank > 0;
          }).length;

          return (
            <button
              key={scout.name}
              onClick={() => setActiveScout(scout.name)}
              className={`scout-rankings-tab ${isActive ? "active" : ""}`}
            >
              <Icon size={18} />
              <span className="scout-rankings-tab-label">{scout.label}</span>
              <span className="scout-rankings-tab-count">({playerCount})</span>
            </button>
          );
        })}
      </div>

      {/* Rankings List */}
      <div className="scout-rankings-content">
        <div className="scout-rankings-list-header">
          <h2>
            {activeScout === "Consensus"
              ? "Consensus Rankings"
              : `${scoutTabs.find((s) => s.name === activeScout)?.label} Rankings`}
          </h2>
          <span className="scout-rankings-count">
            {filteredRankings.length} players ranked
          </span>
        </div>

        <div className="scout-rankings-list">
          {filteredRankings.map((item, index) => (
            <div
              key={item.bio.playerId}
              className="scout-rankings-row"
              onClick={() => handlePlayerClick(item.bio.playerId)}
            >
              <div className="scout-rankings-rank">
                <span className="scout-rankings-rank-number">{index + 1}</span>
              </div>

              <div className="scout-rankings-photo">
                <img
                  src={item.bio.photoUrl}
                  alt={item.bio.name}
                  onError={handleImageError}
                />
                <div className="scout-rankings-photo-placeholder hidden">
                  <User size={32} />
                </div>
              </div>

              <div className="scout-rankings-info">
                <h3 className="scout-rankings-name">{item.bio.name}</h3>
                <div className="scout-rankings-details">
                  <span className="scout-rankings-team">
                    {item.bio.currentTeam}
                  </span>
                  <span className="scout-rankings-separator">•</span>
                  <span className="scout-rankings-league">
                    {item.bio.league}
                  </span>
                  <span className="scout-rankings-separator">•</span>
                  <span className="scout-rankings-measurements">
                    {PlayerBioUtils.formatHeight(item.bio.height)} •{" "}
                    {item.bio.weight} lbs
                  </span>
                </div>
              </div>

              {activeScout === "Consensus" && (
                <div className="scout-rankings-consensus-info">
                  <div className="scout-rankings-consensus-rank">
                    <span className="scout-rankings-consensus-label">
                      Consensus
                    </span>
                    <span className="scout-rankings-consensus-value">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="scout-rankings-range">
                    <span className="scout-rankings-range-label">Range</span>
                    <span className="scout-rankings-range-value">
                      {ScoutRankingUtils.getRankingSpread(item.ranking).min}-
                      {ScoutRankingUtils.getRankingSpread(item.ranking).max}
                    </span>
                  </div>
                </div>
              )}

              <div className="scout-rankings-actions">
                <span className="scout-rankings-view-hint">
                  Click to view profile
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredRankings.length === 0 && (
          <div className="scout-rankings-no-data">
            <h3>No rankings available</h3>
            <p>This scout hasn't ranked any players in our database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
