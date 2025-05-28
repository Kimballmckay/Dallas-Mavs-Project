import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, TrendingUp, BarChart3, User } from "lucide-react";
import type { PlayerBio } from "../types/bio";
import type { ScoutRanking } from "../types/scoutRankings";
import { ScoutRankingUtils } from "../types/scoutRankings";
import { PlayerBioUtils } from "../types/bio";
import draftDataJson from "../data/draftData.json";
import "../css/HomePage.css";

interface DraftData {
  bio: PlayerBio[];
  scoutRankings?: ScoutRanking[];
}

interface TopPlayer {
  bio: PlayerBio;
  consensusRank: number;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real data
  useEffect(() => {
    const loadDraftData = () => {
      try {
        const data: DraftData = draftDataJson as DraftData;

        if (data.bio && data.bio.length > 0) {
          // Get top 3 players
          if (data.scoutRankings && data.scoutRankings.length > 0) {
            const topPlayersData = data.bio
              .map((player) => {
                const ranking = data.scoutRankings?.find(
                  (r) => r.playerId === player.playerId
                );
                if (!ranking) return null;

                return {
                  bio: player,
                  consensusRank: ScoutRankingUtils.getConsensusRank(ranking),
                };
              })
              .filter((item): item is TopPlayer => item !== null)
              .sort((a, b) => a.consensusRank - b.consensusRank)
              .slice(0, 3);

            setTopPlayers(topPlayersData);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading draft data:", error);
        setLoading(false);
      }
    };

    loadDraftData();
  }, []);

  const handlePlayerClick = (playerId: number) => {
    navigate(`/player-profile/${playerId}`);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none";
    e.currentTarget.nextElementSibling?.classList.remove("hidden");
  };

  if (loading) {
    return (
      <div className="homepage">
        <main className="homepage-main">
          <div className="homepage-loading">
            <div className="homepage-loading-title"></div>
            <div className="homepage-loading-stats">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="homepage-loading-stat"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="homepage">
      <main className="homepage-main">
        {/* Header Section */}
        <div className="homepage-header">
          <div className="homepage-title">
            <h1>Dallas Mavericks Draft Operations</h1>
            <p className="homepage-subtitle">
              NBA Draft 2025 • June 25-26, 2025 • Brooklyn, NY
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="homepage-content-grid">
          {/* Quick Navigation */}
          <div className="homepage-section">
            <div className="homepage-section-header">
              <h2>Quick Navigation</h2>
            </div>

            <div className="homepage-nav-grid">
              <button
                onClick={() => navigate("/big-board")}
                className="homepage-nav-card"
              >
                <div className="homepage-nav-icon primary">
                  <TrendingUp size={28} />
                </div>
                <div className="homepage-nav-content">
                  <h3>Big Board</h3>
                  <p>Drag & drop rankings</p>
                </div>
                <div className="homepage-nav-actions">
                  <span className="homepage-nav-hint">
                    Click to view Big Board
                  </span>
                </div>
              </button>

              <button
                onClick={() => navigate("/prospects")}
                className="homepage-nav-card"
              >
                <div className="homepage-nav-icon secondary">
                  <Users size={28} />
                </div>
                <div className="homepage-nav-content">
                  <h3>Prospects</h3>
                  <p>Player database & stats</p>
                </div>
                <div className="homepage-nav-actions">
                  <span className="homepage-nav-hint">
                    Click to view Prospects
                  </span>
                </div>
              </button>

              <button
                onClick={() => navigate("/scouting-rankings")}
                className="homepage-nav-card"
              >
                <div className="homepage-nav-icon success">
                  <BarChart3 size={28} />
                </div>
                <div className="homepage-nav-content">
                  <h3>Scout Rankings</h3>
                  <p>Expert evaluations</p>
                </div>
                <div className="homepage-nav-actions">
                  <span className="homepage-nav-hint">
                    Click to view Scout Rankings
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Top Prospects */}
          <div className="homepage-section">
            <div className="homepage-section-header">
              <h2>Top 3 Prospects</h2>
            </div>

            <div className="homepage-top-players">
              {topPlayers.map((player, index) => (
                <div
                  key={player.bio.playerId}
                  className="homepage-player-card"
                  onClick={() => handlePlayerClick(player.bio.playerId)}
                >
                  <div className="homepage-player-rank">
                    <span>#{index + 1}</span>
                  </div>

                  <div className="homepage-player-photo">
                    <img
                      src={player.bio.photoUrl}
                      alt={player.bio.name}
                      onError={handleImageError}
                    />
                    <div className="homepage-player-photo-placeholder hidden">
                      <User size={24} />
                    </div>
                  </div>

                  <div className="homepage-player-info">
                    <h4>{player.bio.name}</h4>
                    <p>{player.bio.currentTeam}</p>
                    <div className="homepage-player-details">
                      <span>
                        {PlayerBioUtils.formatHeight(player.bio.height)}
                      </span>
                      <span>•</span>
                      <span>{player.bio.weight} lbs</span>
                      <span>•</span>
                      <span>
                        Age {PlayerBioUtils.calculateAge(player.bio.birthDate)}
                      </span>
                    </div>
                  </div>

                  <div className="homepage-player-actions">
                    <span className="homepage-view-hint">
                      Click to view profile
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Draft Dates */}
        <div className="homepage-section">
          <div className="homepage-section-header">
            <h2>Key Draft Dates</h2>
          </div>

          <div className="homepage-events-list">
            <div className="homepage-event-card upcoming">
              <div className="homepage-event-status"></div>
              <div className="homepage-event-content">
                <h4>NBA Draft Early Entry Withdrawal Deadline</h4>
                <div className="homepage-event-details">
                  <div className="homepage-event-detail">
                    <span>June 15, 2025 • 5:00 PM ET</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="homepage-event-card upcoming">
              <div className="homepage-event-status"></div>
              <div className="homepage-event-content">
                <h4>2025 NBA Draft First Round</h4>
                <div className="homepage-event-details">
                  <div className="homepage-event-detail">
                    <span>June 25, 2025 • 8:00 PM ET</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="homepage-event-card upcoming">
              <div className="homepage-event-status"></div>
              <div className="homepage-event-content">
                <h4>2025 NBA Draft Second Round</h4>
                <div className="homepage-event-details">
                  <div className="homepage-event-detail">
                    <span>June 26, 2025 • 8:00 PM ET</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
