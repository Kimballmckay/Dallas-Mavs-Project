export interface GameLog {
  playerId: number;
  gameId: number;
  season: number;
  league: string;
  date: string;
  team: string;
  teamId: number;
  opponentId: number;
  isHome: number;
  opponent: string;
  homeTeamPts: number;
  visitorTeamPts: number;
  gp: number;
  gs: number;
  timePlayed: string;
  fgm: number;
  fga: number;
  "fg%": number;
  tpm: number;
  tpa: number;
  "tp%": number;
  ftm: number;
  fta: number;
  "ft%": number;
  oreb: number;
  dreb: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  pf: number;
  pts: number;
  plusMinus: number;
  rn: number;
}

/*Type guard to check if an object is a valid GameLog*/
export const isGameLog = (obj: any): obj is GameLog => {
  return (
    typeof obj === "object" &&
    typeof obj.playerId === "number" &&
    typeof obj.gameId === "number" &&
    typeof obj.season === "number" &&
    typeof obj.league === "string" &&
    typeof obj.date === "string" &&
    typeof obj.team === "string" &&
    typeof obj.teamId === "number" &&
    typeof obj.opponentId === "number" &&
    typeof obj.isHome === "number" &&
    typeof obj.opponent === "string" &&
    typeof obj.homeTeamPts === "number" &&
    typeof obj.visitorTeamPts === "number" &&
    typeof obj.pts === "number"
  );
};

/*Utility functions for working with GameLog data*/
export class GameLogUtils {
  /*Calculate effective field goal percentage (accounts for 3-pointers)*/
  static calculateEffectiveFieldGoalPercentage(gameLog: GameLog): number {
    if (gameLog.fga === 0) return 0;
    return (
      Math.round(((gameLog.fgm + 0.5 * gameLog.tpm) / gameLog.fga) * 1000) / 10
    );
  }

  /*Calculate true shooting percentage*/
  static calculateTrueShootingPercentage(gameLog: GameLog): number {
    const possessions = 2 * (gameLog.fga + 0.44 * gameLog.fta);
    if (possessions === 0) return 0;
    return Math.round((gameLog.pts / possessions) * 1000) / 10;
  }

  /*Determine if the player's team won the game*/
  static didTeamWin(gameLog: GameLog): boolean {
    if (gameLog.isHome === 1) {
      return gameLog.homeTeamPts > gameLog.visitorTeamPts;
    } else {
      return gameLog.visitorTeamPts > gameLog.homeTeamPts;
    }
  }

  /*Get the game result with score*/
  static getGameResult(gameLog: GameLog): { result: "W" | "L"; score: string } {
    const won = this.didTeamWin(gameLog);
    const teamScore =
      gameLog.isHome === 1 ? gameLog.homeTeamPts : gameLog.visitorTeamPts;
    const opponentScore =
      gameLog.isHome === 1 ? gameLog.visitorTeamPts : gameLog.homeTeamPts;

    return {
      result: won ? "W" : "L",
      score: `${teamScore}-${opponentScore}`,
    };
  }

  /*Convert time played string to minutes as number*/
  static timePlayedToMinutes(timePlayed: string): number {
    const [minutes, seconds] = timePlayed.split(":").map(Number);
    return Math.round((minutes + seconds / 60) * 10) / 10;
  }

  /*Format date to readable string*/
  static formatGameDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
}
