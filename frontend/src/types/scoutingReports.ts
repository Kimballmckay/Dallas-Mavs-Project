export interface ScoutingReport {
  scout: string;
  reportId: string;
  playerId: number;
  report: string;
}

/*Type guard to check if an object is a valid ScoutingReport*/
export const isScoutingReport = (obj: any): obj is ScoutingReport => {
  return (
    typeof obj === "object" &&
    typeof obj.scout === "string" &&
    typeof obj.reportId === "string" &&
    typeof obj.playerId === "number" &&
    typeof obj.report === "string"
  );
};

/*Represents different categories of scouting analysis*/
export interface ScoutingCategories {
  strengths: string[];
  weaknesses: string[];
  offense: string[];
  defense: string[];
  athleticism: string[];
  character: string[];
  projection: string[];
}

/*Utility functions for working with ScoutingReport data*/
export class ScoutingReportUtils {
  /*Get word count of the scouting report*/
  static getWordCount(report: ScoutingReport): number {
    return report.report.trim().split(/\s+/).length;
  }

  /*Get estimated reading time in minutes*/
  static getReadingTime(report: ScoutingReport): number {
    const wordsPerMinute = 200;
    const wordCount = this.getWordCount(report);
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  /*Extract preview text (first N characters)*/
  static getPreview(report: ScoutingReport, maxLength: number = 150): string {
    if (report.report.length <= maxLength) {
      return report.report;
    }

    const truncated = report.report.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");

    return lastSpace > maxLength * 0.8
      ? truncated.substring(0, lastSpace) + "..."
      : truncated + "...";
  }

  /*Check if report mentions specific keywords*/
  static containsKeywords(report: ScoutingReport, keywords: string[]): boolean {
    const reportText = report.report.toLowerCase();
    return keywords.some((keyword) =>
      reportText.includes(keyword.toLowerCase())
    );
  }

  /*Get all reports by a specific scout*/
  static getReportsByScout(
    reports: ScoutingReport[],
    scoutName: string
  ): ScoutingReport[] {
    return reports.filter(
      (report) => report.scout.toLowerCase() === scoutName.toLowerCase()
    );
  }

  /*Get all reports for a specific player*/
  static getReportsForPlayer(
    reports: ScoutingReport[],
    playerId: number
  ): ScoutingReport[] {
    return reports.filter((report) => report.playerId === playerId);
  }

  /*Search reports by text content*/
  static searchReports(
    reports: ScoutingReport[],
    searchTerm: string
  ): ScoutingReport[] {
    const term = searchTerm.toLowerCase();
    return reports.filter(
      (report) =>
        report.report.toLowerCase().includes(term) ||
        report.scout.toLowerCase().includes(term)
    );
  }

  /*Get unique list of scouts from reports*/
  static getUniqueScouts(reports: ScoutingReport[]): string[] {
    const scouts = reports.map((report) => report.scout);
    return [...new Set(scouts)].sort();
  }

  /*Analyze sentiment keywords in report (basic implementation)*/
  static analyzeSentiment(report: ScoutingReport): {
    positive: string[];
    negative: string[];
    neutral: string[];
  } {
    const reportText = report.report.toLowerCase();

    const positiveKeywords = [
      "excellent",
      "outstanding",
      "great",
      "strong",
      "impressive",
      "skilled",
      "talented",
      "elite",
      "dominant",
      "explosive",
      "fluid",
      "smooth",
      "natural",
      "instinctive",
      "high-level",
    ];

    const negativeKeywords = [
      "weak",
      "poor",
      "limited",
      "struggles",
      "concerning",
      "inconsistent",
      "slow",
      "lacks",
      "needs improvement",
      "deficient",
      "questionable",
      "raw",
      "underdeveloped",
      "mechanical",
    ];

    const positiveFound = positiveKeywords.filter((keyword) =>
      reportText.includes(keyword)
    );

    const negativeFound = negativeKeywords.filter((keyword) =>
      reportText.includes(keyword)
    );

    return {
      positive: positiveFound,
      negative: negativeFound,
      neutral: [], // Could be expanded for neutral terms
    };
  }

  /*Extract potential draft position mentions from report*/
  static extractDraftProjection(report: ScoutingReport): string | null {
    const reportText = report.report.toLowerCase();

    // Look for common draft projection patterns
    const patterns = [
      /first round/gi,
      /lottery pick/gi,
      /top (\d+)/gi,
      /(\d+)\w* overall/gi,
      /second round/gi,
      /late first/gi,
      /early second/gi,
      /undrafted/gi,
    ];

    for (const pattern of patterns) {
      const match = reportText.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return null;
  }

  /*Calculate report comprehensiveness score (0-100)*/
  static getComprehensivenessScore(report: ScoutingReport): number {
    const wordCount = this.getWordCount(report);
    const sentiment = this.analyzeSentiment(report);
    const hasProjection = this.extractDraftProjection(report) !== null;

    let score = 0;

    // Word count scoring (0-40 points)
    if (wordCount >= 500) score += 40;
    else if (wordCount >= 300) score += 30;
    else if (wordCount >= 150) score += 20;
    else score += 10;

    // Sentiment analysis scoring (0-30 points)
    const totalSentimentWords =
      sentiment.positive.length + sentiment.negative.length;
    if (totalSentimentWords >= 10) score += 30;
    else if (totalSentimentWords >= 5) score += 20;
    else score += 10;

    // Draft projection scoring (0-30 points)
    if (hasProjection) score += 30;

    return Math.min(100, score);
  }

  /*Format report for display with proper line breaks*/
  static formatReportText(report: ScoutingReport): string {
    return report.report
      .replace(/\. /g, ". \n\n")
      .replace(/\n\n\n+/g, "\n\n")
      .trim();
  }
}
