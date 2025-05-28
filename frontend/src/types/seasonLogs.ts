export interface SeasonLog {
  playerId: number;
  age: string;
  Season: number;
  League: string;
  Team: string;
  w: number;
  l: number;
  GP: number;
  GS: number;
  MP: number;
  FGM: number;
  FGA: number;
  "FG%": number;
  FG2M: number;
  FG2A: number;
  "FG2%": number;
  "eFG%": number;
  "3PM": number;
  "3PA": number;
  "3P%": number;
  FT: number;
  FTA: number;
  FTP: number;
  ORB: number;
  DRB: number;
  TRB: number;
  AST: number;
  STL: number;
  BLK: number;
  TOV: number;
  PF: number;
  PTS: number;
}

/*Type guard to check if an object is a valid SeasonLog*/
export const isSeasonLog = (obj: any): obj is SeasonLog => {
  return (
    typeof obj === "object" &&
    typeof obj.playerId === "number" &&
    typeof obj.age === "string" &&
    typeof obj.Season === "number" &&
    typeof obj.League === "string" &&
    typeof obj.Team === "string" &&
    typeof obj.GP === "number" &&
    typeof obj.PTS === "number"
  );
};

/*Utility functions for working with SeasonLog data*/
export class SeasonLogUtils {
  /*Calculate true shooting percentage*/
  static calculateTrueShootingPercentage(seasonLog: SeasonLog): number {
    const possessions = 2 * (seasonLog.FGA + 0.44 * seasonLog.FTA);
    if (possessions === 0) return 0;
    return Math.round((seasonLog.PTS / possessions) * 1000) / 10;
  }

  /*Calculate assist-to-turnover ratio*/
  static calculateAssistToTurnoverRatio(seasonLog: SeasonLog): number {
    if (seasonLog.TOV === 0) return seasonLog.AST;
    return Math.round((seasonLog.AST / seasonLog.TOV) * 100) / 100;
  }

  /*Calculate usage rate approximation*/
  static calculateUsageRate(seasonLog: SeasonLog): number {
    // Simplified usage rate calculation
    const teamPossessions =
      seasonLog.FGA + 0.44 * seasonLog.FTA + seasonLog.TOV;
    if (teamPossessions === 0) return 0;
    return Math.round((teamPossessions / seasonLog.MP) * 4800) / 100;
  }

  /*Get team record as string*/
  static getTeamRecord(seasonLog: SeasonLog): string {
    return `${seasonLog.w}-${seasonLog.l}`;
  }

  /*Calculate team winning percentage*/
  static getTeamWinningPercentage(seasonLog: SeasonLog): number {
    const totalGames = seasonLog.w + seasonLog.l;
    if (totalGames === 0) return 0;
    return Math.round((seasonLog.w / totalGames) * 1000) / 10;
  }

  /*Get key statistical categories for comparison*/
  static getKeyStats(seasonLog: SeasonLog): {
    scoring: number;
    rebounding: number;
    playmaking: number;
    efficiency: number;
  } {
    return {
      scoring: seasonLog.PTS,
      rebounding: seasonLog.TRB,
      playmaking: seasonLog.AST,
      efficiency: this.calculateTrueShootingPercentage(seasonLog),
    };
  }
}
