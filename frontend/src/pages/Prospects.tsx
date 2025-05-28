import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Search, Filter, ChevronDown } from "lucide-react";
import type { PlayerBio } from "../types/bio";
import type { SeasonLog } from "../types/seasonLogs";
import { PlayerBioUtils } from "../types/bio";
import draftDataJson from "../data/draftData.json";
import "../css/Prospects.css";

interface ProspectData {
  bio: PlayerBio;
  currentSeasonStats?: SeasonLog;
}

interface DraftData {
  bio: PlayerBio[];
  seasonLogs: SeasonLog[];
}

type SortOption = "name" | "age-asc" | "age-desc";
type LeagueFilter = "all" | "ncaa" | "non-ncaa";

export default function Prospects() {
  const navigate = useNavigate();
  const [prospects, setProspects] = useState<ProspectData[]>([]);
  const [filteredProspects, setFilteredProspects] = useState<ProspectData[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [leagueFilter, setLeagueFilter] = useState<LeagueFilter>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data and combine bio with latest season stats
  useEffect(() => {
    const loadProspectsData = () => {
      try {
        const data: DraftData = draftDataJson as DraftData;

        if (!data.bio || !Array.isArray(data.bio)) {
          throw new Error("Invalid data structure: bio array not found");
        }

        // Create prospects with their current season stats
        const prospectsData: ProspectData[] = data.bio.map((player) => {
          // Find the most recent season stats for each player
          const playerSeasonStats = data.seasonLogs?.filter(
            (log) => log.playerId === player.playerId
          );

          // Get the most recent season (highest season number)
          const currentSeasonStats = playerSeasonStats?.reduce(
            (latest, current) => {
              return current.Season > (latest?.Season || 0) ? current : latest;
            },
            undefined as SeasonLog | undefined
          );

          return {
            bio: player,
            currentSeasonStats,
          };
        });

        setProspects(prospectsData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading prospects data:", error);
        setLoading(false);
      }
    };

    loadProspectsData();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...prospects];

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (prospect) =>
          prospect.bio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prospect.bio.currentTeam
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply league filter
    if (leagueFilter !== "all") {
      filtered = filtered.filter((prospect) => {
        const isNCAA = prospect.bio.leagueType?.toLowerCase() === "ncaa";
        return leagueFilter === "ncaa" ? isNCAA : !isNCAA;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "age-asc":
          return (
            PlayerBioUtils.calculateAge(a.bio.birthDate) -
            PlayerBioUtils.calculateAge(b.bio.birthDate)
          );
        case "age-desc":
          return (
            PlayerBioUtils.calculateAge(b.bio.birthDate) -
            PlayerBioUtils.calculateAge(a.bio.birthDate)
          );
        case "name":
        default:
          return a.bio.lastName.localeCompare(b.bio.lastName);
      }
    });

    setFilteredProspects(filtered);
  }, [searchTerm, prospects, sortBy, leagueFilter]);

  const handlePlayerClick = (playerId: number) => {
    navigate(`/player-profile/${playerId}`);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none";
    e.currentTarget.nextElementSibling?.classList.remove("hidden");
  };

  const getLeagueTypeDisplay = (leagueType?: string) => {
    if (!leagueType) return "Unknown";
    return leagueType.toUpperCase();
  };

  if (loading) {
    return (
      <div className="prospects-container">
        <div className="prospects-header">
          <h1>Prospects</h1>
          <p>Loading player data...</p>
        </div>
        <div className="prospects-loading">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="prospects-card-skeleton">
              <div className="prospects-photo-skeleton"></div>
              <div className="prospects-info-skeleton">
                <div className="prospects-name-skeleton"></div>
                <div className="prospects-team-skeleton"></div>
                <div className="prospects-stats-skeleton"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="prospects-container">
      <div className="prospects-header">
        <h1>Prospects</h1>
        <p>Complete player database</p>
      </div>

      {/* Search and Filter Section */}
      <div className="prospects-controls">
        <div className="prospects-search">
          <div className="prospects-search-input">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search players by name or team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className={`prospects-filter-toggle ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            <span>Filters</span>
            <ChevronDown size={16} className={showFilters ? "rotated" : ""} />
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="prospects-filters">
            <div className="prospects-filter-group">
              <label className="prospects-filter-label">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="prospects-filter-select"
              >
                <option value="name">Name (A-Z)</option>
                <option value="age-asc">Age (Youngest First)</option>
                <option value="age-desc">Age (Oldest First)</option>
              </select>
            </div>

            <div className="prospects-filter-group">
              <label className="prospects-filter-label">League:</label>
              <select
                value={leagueFilter}
                onChange={(e) =>
                  setLeagueFilter(e.target.value as LeagueFilter)
                }
                className="prospects-filter-select"
              >
                <option value="all">All Leagues</option>
                <option value="ncaa">NCAA Only</option>
                <option value="non-ncaa">Non-NCAA Only</option>
              </select>
            </div>

            <div className="prospects-filter-group">
              <button
                className="prospects-clear-filters"
                onClick={() => {
                  setSortBy("name");
                  setLeagueFilter("all");
                  setSearchTerm("");
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Players Grid */}
      <div className="prospects-grid">
        {filteredProspects.map((prospect) => (
          <div
            key={prospect.bio.playerId}
            className="prospects-card"
            onClick={() => handlePlayerClick(prospect.bio.playerId)}
          >
            <div className="prospects-photo">
              <img
                src={prospect.bio.photoUrl}
                alt={prospect.bio.name}
                onError={handleImageError}
              />
              <div className="prospects-photo-placeholder hidden">
                <User size={48} />
              </div>
            </div>

            <div className="prospects-info">
              <h3 className="prospects-name">{prospect.bio.name}</h3>
              <div className="prospects-details">
                <span className="prospects-team">
                  {prospect.bio.currentTeam}
                </span>
                <span className="prospects-separator">•</span>
                <span className="prospects-league">
                  {getLeagueTypeDisplay(prospect.bio.leagueType)}
                </span>
              </div>

              {prospect.currentSeasonStats ? (
                <div className="prospects-stats">
                  <div className="prospects-stat">
                    <span className="prospects-stat-value">
                      {prospect.currentSeasonStats.PTS.toFixed(1)}
                    </span>
                    <span className="prospects-stat-label">PPG</span>
                  </div>
                  <div className="prospects-stat">
                    <span className="prospects-stat-value">
                      {prospect.currentSeasonStats.TRB.toFixed(1)}
                    </span>
                    <span className="prospects-stat-label">RPG</span>
                  </div>
                  <div className="prospects-stat">
                    <span className="prospects-stat-value">
                      {prospect.currentSeasonStats.AST.toFixed(1)}
                    </span>
                    <span className="prospects-stat-label">APG</span>
                  </div>
                  <div className="prospects-stat">
                    <span className="prospects-stat-value">
                      {prospect.currentSeasonStats["FG%"].toFixed(2)}%
                    </span>
                    <span className="prospects-stat-label">FG%</span>
                  </div>
                  <div className="prospects-stat">
                    <span className="prospects-stat-value">
                      {prospect.currentSeasonStats["3P%"].toFixed(2)}%
                    </span>
                    <span className="prospects-stat-label">3P%</span>
                  </div>
                </div>
              ) : (
                <div className="prospects-stats-unavailable">
                  <span>Stats not available</span>
                </div>
              )}

              <div className="prospects-additional-info">
                <span>{PlayerBioUtils.formatHeight(prospect.bio.height)}</span>
                <span className="prospects-separator">•</span>
                <span>{prospect.bio.weight} lbs</span>
                <span className="prospects-separator">•</span>
                <span>
                  Age {PlayerBioUtils.calculateAge(prospect.bio.birthDate)}
                </span>
              </div>
            </div>

            <div className="prospects-hover-hint">
              <span>Click to view profile</span>
            </div>
          </div>
        ))}
      </div>

      {filteredProspects.length === 0 && !loading && (
        <div className="prospects-no-results">
          <h3>No players found</h3>
          <p>Try adjusting your search terms or filters</p>
        </div>
      )}
    </div>
  );
}
