// This interface matches your JSON structure exactly
export interface Highlight {
  playerId: number;
  highlightUrl: string;
}

export interface HighlightsData {
  highlights: Highlight[];
}

export class HighlightUtils {
  /**
   * Get highlights for a specific player using your JSON data structure
   */
  static getPlayerHighlights(
    highlightsData: HighlightsData,
    playerId: number
  ): Highlight[] {
    return highlightsData.highlights.filter(
      (highlight) => highlight.playerId === playerId
    );
  }

  /**
   * Check if a player has highlights available
   */
  static hasHighlights(
    highlightsData: HighlightsData,
    playerId: number
  ): boolean {
    return highlightsData.highlights.some(
      (highlight) => highlight.playerId === playerId
    );
  }

  /**
   * Get the first highlight for a player
   */
  static getFirstHighlight(
    highlightsData: HighlightsData,
    playerId: number
  ): Highlight | null {
    const playerHighlights = this.getPlayerHighlights(highlightsData, playerId);
    return playerHighlights.length > 0 ? playerHighlights[0] : null;
  }

  /**
   * Get YouTube video ID from your URL format
   */
  static getVideoId(url: string): string | null {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  }

  /**
   * Convert your YouTube URL to embed format for iframe
   */
  static getEmbedUrl(url: string): string | null {
    const videoId = this.getVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }

  /**
   * Get YouTube thumbnail URL from your video URLs
   */
  static getThumbnailUrl(url: string): string | null {
    const videoId = this.getVideoId(url);
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : null;
  }
}
