export interface PlayerBio {
  name: string;
  playerId: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  height: number;
  weight: number;
  highSchool: string;
  highSchoolState: string;
  homeTown: string;
  homeState: string;
  homeCountry: string;
  nationality: string;
  photoUrl: string;
  currentTeam: string;
  league: string;
  leagueType: string;
}

/*Type guard to check if an object is a valid PlayerBio*/
export const isPlayerBio = (obj: any): obj is PlayerBio => {
  return (
    typeof obj === "object" &&
    typeof obj.name === "string" &&
    typeof obj.playerId === "number" &&
    typeof obj.firstName === "string" &&
    typeof obj.lastName === "string" &&
    typeof obj.birthDate === "string" &&
    typeof obj.height === "number" &&
    typeof obj.weight === "number" &&
    typeof obj.highSchool === "string" &&
    typeof obj.highSchoolState === "string" &&
    typeof obj.homeTown === "string" &&
    typeof obj.homeState === "string" &&
    typeof obj.homeCountry === "string" &&
    typeof obj.nationality === "string" &&
    typeof obj.photoUrl === "string" &&
    typeof obj.currentTeam === "string" &&
    typeof obj.league === "string" &&
    typeof obj.leagueType === "string"
  );
};

/*Utility functions for working with PlayerBio data*/
export class PlayerBioUtils {
  /*Calculate player's age based on birth dat */
  static calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }

  /*Format height from inches to feet and inches display*/
  static formatHeight(heightInches: number): string {
    const feet = Math.floor(heightInches / 12);
    const inches = heightInches % 12;
    return `${feet}'${inches}"`;
  }

  /*Get player's full location (hometown, state)*/
  static getFullLocation(player: PlayerBio): string {
    return `${player.homeTown}, ${player.homeState}`;
  }

  /*Get player's high school location*/
  static getHighSchoolLocation(player: PlayerBio): string {
    return `${player.highSchool} (${player.highSchoolState})`;
  }

  /*Check if player is international*/
  static isInternational(player: PlayerBio): boolean {
    return player.nationality !== "USA";
  }

  /*Get player's initials*/
  static getInitials(player: PlayerBio): string {
    return `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`;
  }
}
