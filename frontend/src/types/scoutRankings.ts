export interface ScoutRanking {
  playerId: number;
  "ESPN Rank": number;
  "Sam Vecenie Rank": number;
  "Kevin O'Connor Rank": number;
  "Kyle Boone Rank": number;
  "Gary Parrish Rank": number;
}

/*Type guard to check if an object is a valid ScoutRanking*/
export const isScoutRanking = (obj: any): obj is ScoutRanking => {
  return (
    typeof obj === "object" &&
    typeof obj.playerId === "number" &&
    typeof obj["ESPN Rank"] === "number" &&
    typeof obj["Sam Vecenie Rank"] === "number" &&
    typeof obj["Kevin O'Connor Rank"] === "number" &&
    typeof obj["Kyle Boone Rank"] === "number" &&
    typeof obj["Gary Parrish Rank"] === "number"
  );
};

/*Utility functions for working with ScoutRanking data*/
export class ScoutRankingUtils {
  /*Calculate the average ranking across all scouts*/
  static getAverageRank(ranking: ScoutRanking): number {
    const ranks = [
      ranking["ESPN Rank"],
      ranking["Sam Vecenie Rank"],
      ranking["Kevin O'Connor Rank"],
      ranking["Kyle Boone Rank"],
      ranking["Gary Parrish Rank"],
    ];

    const validRanks = ranks.filter((rank) => rank > 0);
    const sum = validRanks.reduce((acc, rank) => acc + rank, 0);

    return Math.round((sum / validRanks.length) * 10) / 10;
  }

  /*Get consensus ranking (rounded average)*/
  static getConsensusRank(ranking: ScoutRanking): number {
    return Math.round(this.getAverageRank(ranking));
  }

  /*Get the spread of rankings (min, max, variance)*/
  static getRankingSpread(ranking: ScoutRanking): {
    min: number;
    max: number;
    spread: number;
  } {
    const ranks = [
      ranking["ESPN Rank"],
      ranking["Sam Vecenie Rank"],
      ranking["Kevin O'Connor Rank"],
      ranking["Kyle Boone Rank"],
      ranking["Gary Parrish Rank"],
    ].filter((rank) => rank > 0);

    const min = Math.min(...ranks);
    const max = Math.max(...ranks);

    return {
      min,
      max,
      spread: max - min,
    };
  }

  /*Get array of all scout names*/
  static getScoutNames(): string[] {
    return [
      "ESPN Rank",
      "Sam Vecenie Rank",
      "Kevin O'Connor Rank",
      "Kyle Boone Rank",
      "Gary Parrish Rank",
    ];
  }

  /*Get ranking from specific scout*/
  static getRankByScout(
    ranking: ScoutRanking,
    scoutName: keyof ScoutRanking
  ): number {
    return ranking[scoutName] as number;
  }

  /*Check if player is ranked in top 10 by consensus*/
  static isTopTenPlayer(ranking: ScoutRanking): boolean {
    return this.getConsensusRank(ranking) <= 10;
  }

  /*Check if player is projected as first round pick*/
  static isFirstRoundPlayer(ranking: ScoutRanking): boolean {
    return this.getConsensusRank(ranking) <= 30;
  }
}
