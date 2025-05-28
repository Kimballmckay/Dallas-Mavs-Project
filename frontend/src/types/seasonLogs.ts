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

  /*Calculate player efficiency rating (PER) approximation*/
  static calculatePER(seasonLog: SeasonLog): number {
    if (seasonLog.MP === 0) return 0;

    const per =
      (seasonLog.PTS +
        seasonLog.TRB +
        seasonLog.AST +
        seasonLog.STL +
        seasonLog.BLK -
        (seasonLog.FGA - seasonLog.FGM) -
        (seasonLog.FTA - seasonLog.FT) -
        seasonLog.TOV) /
      seasonLog.MP;

    return Math.round(per * 100) / 100;
  }

  /*Check if player is averaging a double-double*/
  static isAveragingDoubleDouble(seasonLog: SeasonLog): boolean {
    const stats = [
      seasonLog.PTS,
      seasonLog.TRB,
      seasonLog.AST,
      seasonLog.STL,
      seasonLog.BLK,
    ];
    const doubleDigitStats = stats.filter((stat) => stat >= 10).length;
    return doubleDigitStats >= 2;
  }

  /*Get shooting efficiency grade*/
  static getShootingGrade(
    seasonLog: SeasonLog
  ): "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F" {
    const ts = this.calculateTrueShootingPercentage(seasonLog);

    if (ts >= 65) return "A+";
    if (ts >= 60) return "A";
    if (ts >= 57) return "B+";
    if (ts >= 54) return "B";
    if (ts >= 51) return "C+";
    if (ts >= 48) return "C";
    if (ts >= 45) return "D";
    return "F";
  }

  /*Calculate games started percentage*/
  static getStarterPercentage(seasonLog: SeasonLog): number {
    if (seasonLog.GP === 0) return 0;
    return Math.round((seasonLog.GS / seasonLog.GP) * 1000) / 10;
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

  /*Format season for display*/
  static formatSeason(season: number): string {
    return `${season - 1}-${season.toString().slice(-2)}`;
  }

  /*Check if player is a high-volume scorer*/
  static isHighVolumeScorer(seasonLog: SeasonLog): boolean {
    return seasonLog.PTS >= 20 && seasonLog.FGA >= 15;
  }

  /*Check if player is an efficient shooter*/
  static isEfficientShooter(seasonLog: SeasonLog): boolean {
    return (
      seasonLog["FG%"] >= 50 ||
      seasonLog["eFG%"] >= 55 ||
      this.calculateTrueShootingPercentage(seasonLog) >= 60
    );
  }
}
