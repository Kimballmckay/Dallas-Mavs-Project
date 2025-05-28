import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  School,
  Trophy,
  BarChart3,
  Target,
  Play,
  FileText,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
} from "lucide-react";
import type { PlayerBio } from "../types/bio";
import type { SeasonLog } from "../types/seasonLogs";
import type { GameLog } from "../types/gameLogs";
import type { ScoutingReport } from "../types/scoutingReports";
import type { ScoutRanking } from "../types/scoutRankings";
import type { Highlight, HighlightsData } from "../types/highlights";
import { PlayerBioUtils } from "../types/bio";
import { SeasonLogUtils } from "../types/seasonLogs";
import { ScoutRankingUtils } from "../types/scoutRankings";
import { HighlightUtils } from "../types/highlights";
import draftDataJson from "../data/draftData.json";
import highlightsDataJson from "../data/highlightsData.json";
import "../css/PlayerProfile.css";

interface DraftData {
  bio: PlayerBio[];
  seasonLogs?: SeasonLog[];
  gameLogs?: GameLog[];
  scoutingReports?: ScoutingReport[];
  scoutRankings?: ScoutRanking[];
}

interface PlayerData {
  bio: PlayerBio;
  seasonLogs: SeasonLog[];
  gameLogs: GameLog[];
  scoutingReports: ScoutingReport[];
  scoutRanking?: ScoutRanking;
  highlights: Highlight[];
}

interface ScoutingNote {
  id: string;
  playerId: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Persistent storage for scouting notes using a simple object-based approach
const scoutingNotesStorage = {
  STORAGE_KEY: "playerScoutingNotes",

  // Load all notes from storage
  loadAllNotes(): Record<string, ScoutingNote[]> {
    try {
      const stored = window.localStorage?.getItem(this.STORAGE_KEY);
      if (!stored) return {};

      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      Object.keys(parsed).forEach((playerId) => {
        parsed[playerId] = parsed[playerId].map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
      });

      return parsed;
    } catch (error) {
      console.error("Error loading scouting notes:", error);
      return {};
    }
  },

  // Save all notes to storage
  saveAllNotes(notes: Record<string, ScoutingNote[]>): void {
    try {
      window.localStorage?.setItem(this.STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error("Error saving scouting notes:", error);
    }
  },

  getPlayerNotes(playerId: number): ScoutingNote[] {
    const allNotes = this.loadAllNotes();
    return allNotes[playerId.toString()] || [];
  },

  addNote(
    playerId: number,
    note: Omit<ScoutingNote, "id" | "createdAt" | "updatedAt">
  ): ScoutingNote {
    const allNotes = this.loadAllNotes();
    const playerKey = playerId.toString();
    const playerNotes = allNotes[playerKey] || [];

    const newNote: ScoutingNote = {
      ...note,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    playerNotes.push(newNote);
    allNotes[playerKey] = playerNotes;
    this.saveAllNotes(allNotes);

    return newNote;
  },

  updateNote(
    playerId: number,
    noteId: string,
    updates: Partial<Pick<ScoutingNote, "title" | "content">>
  ): ScoutingNote | null {
    const allNotes = this.loadAllNotes();
    const playerKey = playerId.toString();
    const playerNotes = allNotes[playerKey] || [];
    const noteIndex = playerNotes.findIndex((note) => note.id === noteId);

    if (noteIndex === -1) return null;

    playerNotes[noteIndex] = {
      ...playerNotes[noteIndex],
      ...updates,
      updatedAt: new Date(),
    };

    allNotes[playerKey] = playerNotes;
    this.saveAllNotes(allNotes);

    return playerNotes[noteIndex];
  },

  deleteNote(playerId: number, noteId: string): boolean {
    const allNotes = this.loadAllNotes();
    const playerKey = playerId.toString();
    const playerNotes = allNotes[playerKey] || [];
    const filteredNotes = playerNotes.filter((note) => note.id !== noteId);

    if (filteredNotes.length === playerNotes.length) return false;

    allNotes[playerKey] = filteredNotes;
    this.saveAllNotes(allNotes);

    return true;
  },
};

export default function PlayerProfile() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "stats" | "scouting" | "notes" | "highlights"
  >("stats");
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(
    null
  );

  // Scouting notes state
  const [scoutingNotes, setScoutingNotes] = useState<ScoutingNote[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  useEffect(() => {
    const loadPlayerData = () => {
      try {
        if (!playerId) {
          setLoading(false);
          return;
        }

        const data: DraftData = draftDataJson as DraftData;
        const highlightsData: HighlightsData =
          highlightsDataJson as HighlightsData;
        const playerIdNum = parseInt(playerId);

        // Find player bio
        const bio = data.bio?.find((p) => p.playerId === playerIdNum);
        if (!bio) {
          setLoading(false);
          return;
        }

        // Get all related data
        const seasonLogs =
          data.seasonLogs?.filter((log) => log.playerId === playerIdNum) || [];
        const gameLogs =
          data.gameLogs?.filter((log) => log.playerId === playerIdNum) || [];
        const scoutingReports =
          data.scoutingReports?.filter(
            (report) => report.playerId === playerIdNum
          ) || [];
        const scoutRanking = data.scoutRankings?.find(
          (ranking) => ranking.playerId === playerIdNum
        );
        // Get highlights for this specific player using your JSON data
        const highlights = HighlightUtils.getPlayerHighlights(
          highlightsData,
          playerIdNum
        );

        // Sort season logs by season (most recent first)
        seasonLogs.sort((a, b) => b.Season - a.Season);

        // Sort game logs by date (most recent first)
        gameLogs.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setPlayerData({
          bio,
          seasonLogs,
          gameLogs,
          scoutingReports,
          scoutRanking,
          highlights,
        });

        // Load scouting notes for this player
        const notes = scoutingNotesStorage.getPlayerNotes(playerIdNum);
        setScoutingNotes(notes);

        // Auto-select first highlight if available - convert to embed URL
        const firstHighlight = HighlightUtils.getFirstHighlight(
          highlightsData,
          playerIdNum
        );
        if (firstHighlight) {
          const embedUrl = HighlightUtils.getEmbedUrl(
            firstHighlight.highlightUrl
          );
          setSelectedHighlight(embedUrl);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading player data:", error);
        setLoading(false);
      }
    };

    loadPlayerData();
  }, [playerId]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none";
    e.currentTarget.nextElementSibling?.classList.remove("hidden");
  };

  // Calculate consensus rank using same logic as ScoutRankings page
  const getConsensusRankPosition = (scoutRanking: ScoutRanking): number => {
    const data = draftDataJson as DraftData;
    if (!data.scoutRankings)
      return ScoutRankingUtils.getConsensusRank(scoutRanking);

    const allRankings = data.scoutRankings
      .map((ranking) => ({
        playerId: ranking.playerId,
        consensusRank: ScoutRankingUtils.getConsensusRank(ranking),
        averageRank: ScoutRankingUtils.getAverageRank(ranking),
      }))
      .filter((item) => item.consensusRank > 0)
      .sort((a, b) => {
        if (a.consensusRank !== b.consensusRank) {
          return a.consensusRank - b.consensusRank;
        }
        return a.averageRank - b.averageRank;
      });

    const playerIndex = allRankings.findIndex(
      (r) => r.playerId === scoutRanking.playerId
    );
    return playerIndex >= 0
      ? playerIndex + 1
      : ScoutRankingUtils.getConsensusRank(scoutRanking);
  };

  // Scouting notes functions
  const handleAddNote = () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim() || !playerData) return;

    const newNote = scoutingNotesStorage.addNote(playerData.bio.playerId, {
      playerId: playerData.bio.playerId,
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
    });

    setScoutingNotes((prev) => [...prev, newNote]);
    setNewNoteTitle("");
    setNewNoteContent("");
    setIsAddingNote(false);
  };

  const handleEditNote = (noteId: string) => {
    const note = scoutingNotes.find((n) => n.id === noteId);
    if (note) {
      setNewNoteTitle(note.title);
      setNewNoteContent(note.content);
      setEditingNoteId(noteId);
    }
  };

  const handleUpdateNote = () => {
    if (
      !newNoteTitle.trim() ||
      !newNoteContent.trim() ||
      !playerData ||
      !editingNoteId
    )
      return;

    const updatedNote = scoutingNotesStorage.updateNote(
      playerData.bio.playerId,
      editingNoteId,
      {
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
      }
    );

    if (updatedNote) {
      setScoutingNotes((prev) =>
        prev.map((note) => (note.id === editingNoteId ? updatedNote : note))
      );
    }

    setNewNoteTitle("");
    setNewNoteContent("");
    setEditingNoteId(null);
  };

  const handleDeleteNote = (noteId: string) => {
    if (!playerData) return;

    const success = scoutingNotesStorage.deleteNote(
      playerData.bio.playerId,
      noteId
    );
    if (success) {
      setScoutingNotes((prev) => prev.filter((note) => note.id !== noteId));
    }
  };

  const handleCancelEdit = () => {
    setNewNoteTitle("");
    setNewNoteContent("");
    setIsAddingNote(false);
    setEditingNoteId(null);
  };

  if (loading) {
    return (
      <div className="player-profile-container">
        <div className="player-profile-loading">
          <div className="player-profile-skeleton-header"></div>
          <div className="player-profile-skeleton-content"></div>
        </div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="player-profile-container">
        <div className="player-profile-not-found">
          <h2>Player Not Found</h2>
          <p>The player you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="player-profile-back-button"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { bio, seasonLogs, scoutRanking, highlights } = playerData;
  const currentSeason = seasonLogs[0]; // Most recent season
  const age = PlayerBioUtils.calculateAge(bio.birthDate);

  return (
    <div className="player-profile-container">
      {/* Header */}
      <div className="player-profile-header">
        <button
          onClick={() => navigate(-1)}
          className="player-profile-back-button"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="player-profile-main-info">
          <div className="player-profile-photo">
            <img src={bio.photoUrl} alt={bio.name} onError={handleImageError} />
            <div className="player-profile-photo-placeholder hidden">
              <User size={64} />
            </div>
          </div>

          <div className="player-profile-details">
            <h1 className="player-profile-name">{bio.name}</h1>
            <div className="player-profile-basic-info">
              <span className="player-profile-team">{bio.currentTeam}</span>
              <span className="player-profile-separator">•</span>
              <span className="player-profile-league">{bio.league}</span>
            </div>

            <div className="player-profile-measurements">
              <div className="player-profile-measurement">
                <span className="player-profile-measurement-label">Height</span>
                <span className="player-profile-measurement-value">
                  {PlayerBioUtils.formatHeight(bio.height)}
                </span>
              </div>
              <div className="player-profile-measurement">
                <span className="player-profile-measurement-label">Weight</span>
                <span className="player-profile-measurement-value">
                  {bio.weight} lbs
                </span>
              </div>
              <div className="player-profile-measurement">
                <span className="player-profile-measurement-label">Age</span>
                <span className="player-profile-measurement-value">{age}</span>
              </div>
            </div>
          </div>

          {scoutRanking && (
            <div className="player-profile-ranking">
              <div className="player-profile-consensus-rank">
                <span className="player-profile-rank-number">
                  #{getConsensusRankPosition(scoutRanking)}
                </span>
                <span className="player-profile-rank-label">
                  Consensus Rank
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bio Section */}
      <div className="player-profile-bio-section">
        <div className="player-profile-bio-grid">
          <div className="player-profile-bio-item">
            <Calendar size={18} />
            <div>
              <span className="player-profile-bio-label">Born</span>
              <span className="player-profile-bio-value">
                {new Date(bio.birthDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="player-profile-bio-item">
            <MapPin size={18} />
            <div>
              <span className="player-profile-bio-label">Hometown</span>
              <span className="player-profile-bio-value">
                {PlayerBioUtils.getFullLocation(bio)}
              </span>
            </div>
          </div>

          <div className="player-profile-bio-item">
            <School size={18} />
            <div>
              <span className="player-profile-bio-label">High School</span>
              <span className="player-profile-bio-value">
                {PlayerBioUtils.getHighSchoolLocation(bio)}
              </span>
            </div>
          </div>

          <div className="player-profile-bio-item">
            <Trophy size={18} />
            <div>
              <span className="player-profile-bio-label">Nationality</span>
              <span className="player-profile-bio-value">
                {bio.nationality}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="player-profile-tabs">
        <button
          className={`player-profile-tab ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          <BarChart3 size={18} />
          Season Stats
        </button>
        <button
          className={`player-profile-tab ${activeTab === "scouting" ? "active" : ""}`}
          onClick={() => setActiveTab("scouting")}
        >
          <Target size={18} />
          Scout Rankings
        </button>
        <button
          className={`player-profile-tab ${activeTab === "notes" ? "active" : ""}`}
          onClick={() => setActiveTab("notes")}
        >
          <FileText size={18} />
          Scouting Report
        </button>
        <button
          className={`player-profile-tab ${activeTab === "highlights" ? "active" : ""}`}
          onClick={() => setActiveTab("highlights")}
        >
          <Play size={18} />
          Highlights
        </button>
      </div>

      {/* Tab Content */}
      <div className="player-profile-content">
        {activeTab === "stats" && (
          <div className="player-profile-stats-section">
            {seasonLogs.length > 0 ? (
              <>
                {/* Current Season Highlights */}
                {currentSeason && (
                  <div className="player-profile-current-stats">
                    <h3>
                      {SeasonLogUtils.formatSeason(currentSeason.Season)} Season
                      <span className="player-profile-team-record">
                        Team Record:{" "}
                        {SeasonLogUtils.getTeamRecord(currentSeason)}(
                        {SeasonLogUtils.getTeamWinningPercentage(currentSeason)}
                        %)
                      </span>
                    </h3>
                    <div className="player-profile-stats-grid">
                      <div className="player-profile-stat-card">
                        <span className="player-profile-stat-value">
                          {currentSeason.PTS.toFixed(1)}
                        </span>
                        <span className="player-profile-stat-label">PPG</span>
                      </div>
                      <div className="player-profile-stat-card">
                        <span className="player-profile-stat-value">
                          {currentSeason.TRB.toFixed(1)}
                        </span>
                        <span className="player-profile-stat-label">RPG</span>
                      </div>
                      <div className="player-profile-stat-card">
                        <span className="player-profile-stat-value">
                          {currentSeason.AST.toFixed(1)}
                        </span>
                        <span className="player-profile-stat-label">APG</span>
                      </div>
                      <div className="player-profile-stat-card">
                        <span className="player-profile-stat-value">
                          {currentSeason["FG%"].toFixed(2)}%
                        </span>
                        <span className="player-profile-stat-label">FG%</span>
                      </div>
                      <div className="player-profile-stat-card">
                        <span className="player-profile-stat-value">
                          {currentSeason["3P%"].toFixed(2)}%
                        </span>
                        <span className="player-profile-stat-label">3P%</span>
                      </div>
                      <div className="player-profile-stat-card">
                        <span className="player-profile-stat-value">
                          {SeasonLogUtils.calculateTrueShootingPercentage(
                            currentSeason
                          ).toFixed(2)}
                          %
                        </span>
                        <span className="player-profile-stat-label">TS%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* All Seasons Table */}
                <div className="player-profile-all-seasons">
                  <h3>Career Statistics</h3>
                  <div className="player-profile-stats-table-container">
                    <table className="player-profile-stats-table">
                      <thead>
                        <tr>
                          <th>Season</th>
                          <th>Team</th>
                          <th>GP</th>
                          <th>GS</th>
                          <th>MPG</th>
                          <th>PPG</th>
                          <th>RPG</th>
                          <th>APG</th>
                          <th>FG%</th>
                          <th>3P%</th>
                          <th>FT%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seasonLogs.map((season, index) => (
                          <tr key={index}>
                            <td>
                              {SeasonLogUtils.formatSeason(season.Season)}
                            </td>
                            <td>{season.Team}</td>
                            <td>{season.GP}</td>
                            <td>{season.GS}</td>
                            <td>{season.MP.toFixed(1)}</td>
                            <td>{season.PTS.toFixed(1)}</td>
                            <td>{season.TRB.toFixed(1)}</td>
                            <td>{season.AST.toFixed(1)}</td>
                            <td>{season["FG%"].toFixed(2)}%</td>
                            <td>{season["3P%"].toFixed(2)}%</td>
                            <td>{season.FTP.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="player-profile-no-data">
                <p>No season statistics available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "scouting" && (
          <div className="player-profile-scouting-section">
            {scoutRanking ? (
              <div className="player-profile-scout-rankings">
                <h3>Scout Rankings</h3>
                <div className="player-profile-rankings-grid">
                  {ScoutRankingUtils.getScoutNames().map((scoutName) => {
                    const rank = ScoutRankingUtils.getRankByScout(
                      scoutRanking,
                      scoutName as keyof ScoutRanking
                    );
                    return (
                      <div
                        key={scoutName}
                        className="player-profile-ranking-item"
                      >
                        <span className="player-profile-scout-name">
                          {scoutName.replace(" Rank", "")}
                        </span>
                        <span className="player-profile-scout-rank">
                          #{rank}
                        </span>
                      </div>
                    );
                  })}
                  <div className="player-profile-ranking-item consensus">
                    <span className="player-profile-scout-name">Consensus</span>
                    <span className="player-profile-scout-rank">
                      #{getConsensusRankPosition(scoutRanking)}
                    </span>
                  </div>
                </div>

                <div className="player-profile-ranking-summary">
                  <h4>Ranking Summary</h4>
                  <div className="player-profile-summary-stats">
                    <div className="player-profile-summary-item">
                      <span className="player-profile-summary-label">
                        Average Rank
                      </span>
                      <span className="player-profile-summary-value">
                        #
                        {ScoutRankingUtils.getAverageRank(scoutRanking).toFixed(
                          1
                        )}
                      </span>
                    </div>
                    <div className="player-profile-summary-item">
                      <span className="player-profile-summary-label">
                        Highest Rank
                      </span>
                      <span className="player-profile-summary-value">
                        #{ScoutRankingUtils.getRankingSpread(scoutRanking).min}
                      </span>
                    </div>
                    <div className="player-profile-summary-item">
                      <span className="player-profile-summary-label">
                        Lowest Rank
                      </span>
                      <span className="player-profile-summary-value">
                        #{ScoutRankingUtils.getRankingSpread(scoutRanking).max}
                      </span>
                    </div>
                    <div className="player-profile-summary-item">
                      <span className="player-profile-summary-label">
                        Rank Spread
                      </span>
                      <span className="player-profile-summary-value">
                        {
                          ScoutRankingUtils.getRankingSpread(scoutRanking)
                            .spread
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="player-profile-no-data">
                <p>No scout rankings available for this player</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="player-profile-notes-section">
            <div className="player-profile-notes-header">
              <h3>Scouting Report</h3>
              {!isAddingNote && !editingNoteId && (
                <button
                  className="player-profile-add-note-button"
                  onClick={() => setIsAddingNote(true)}
                >
                  <Plus size={18} />
                  Add Report
                </button>
              )}
            </div>

            {/* Add/Edit Note Form */}
            {(isAddingNote || editingNoteId) && (
              <div className="player-profile-note-form">
                <div className="player-profile-note-form-header">
                  <h4>{editingNoteId ? "Edit Report" : "Add New Report"}</h4>
                  <button
                    className="player-profile-cancel-button"
                    onClick={handleCancelEdit}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="player-profile-form-group">
                  <label className="player-profile-form-label">Title</label>
                  <input
                    type="text"
                    className="player-profile-form-input"
                    placeholder="Enter report title..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="player-profile-form-group">
                  <label className="player-profile-form-label">Content</label>
                  <textarea
                    className="player-profile-form-textarea"
                    placeholder="Enter your scouting report..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="player-profile-form-actions">
                  <button
                    className="player-profile-save-button"
                    onClick={editingNoteId ? handleUpdateNote : handleAddNote}
                    disabled={!newNoteTitle.trim() || !newNoteContent.trim()}
                  >
                    <Save size={18} />
                    {editingNoteId ? "Update Report" : "Save Report"}
                  </button>
                  <button
                    className="player-profile-cancel-text-button"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Notes List */}
            <div className="player-profile-notes-list">
              {scoutingNotes.length > 0 ? (
                scoutingNotes
                  .sort(
                    (a, b) =>
                      new Date(b.updatedAt).getTime() -
                      new Date(a.updatedAt).getTime()
                  )
                  .map((note) => (
                    <div key={note.id} className="player-profile-note-card">
                      <div className="player-profile-note-header">
                        <h4 className="player-profile-note-title">
                          {note.title}
                        </h4>
                        <div className="player-profile-note-actions">
                          <button
                            className="player-profile-edit-button"
                            onClick={() => handleEditNote(note.id)}
                            title="Edit note"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            className="player-profile-delete-button"
                            onClick={() => handleDeleteNote(note.id)}
                            title="Delete note"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="player-profile-note-content">
                        {note.content}
                      </div>

                      <div className="player-profile-note-meta">
                        <span className="player-profile-note-date">
                          {note.createdAt.toLocaleDateString()} at{" "}
                          {note.createdAt.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {note.updatedAt > note.createdAt && (
                          <span className="player-profile-note-updated">
                            • Updated {note.updatedAt.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="player-profile-no-data">
                  <p>
                    No scouting notes yet. Add your first note to get started!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "highlights" && (
          <div className="player-profile-highlights-section">
            {highlights && highlights.length > 0 ? (
              <div className="player-profile-highlights">
                <h3>Player Highlights</h3>

                {/* Video Player */}
                {selectedHighlight && (
                  <div className="player-profile-video-container">
                    <iframe
                      src={selectedHighlight}
                      title="Player Highlight"
                      frameBorder="0"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      style={{
                        width: "100%",
                        height: "500px",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="player-profile-no-data">
                <p>No highlights available for this player</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
