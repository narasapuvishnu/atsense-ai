import { AnalysisResult } from '../schemas/analysis.schema';

export type MatchLevel =
  | 'Exceptional Match'
  | 'Strong Match'
  | 'Good Match'
  | 'Moderate Match'
  | 'Weak Match'
  | 'Low Match';

export interface ScoreBreakdown {
  score: number;
  matchLevel: MatchLevel;
  color: string;
  description: string;
}

export class ATSScoringService {
  getMatchLevel(score: number): MatchLevel {
    if (score >= 90) return 'Exceptional Match';
    if (score >= 80) return 'Strong Match';
    if (score >= 70) return 'Good Match';
    if (score >= 60) return 'Moderate Match';
    if (score >= 40) return 'Weak Match';
    return 'Low Match';
  }

  getScoreBreakdown(score: number): ScoreBreakdown {
    const matchLevel = this.getMatchLevel(score);

    const breakdowns: Record<MatchLevel, { color: string; description: string }> = {
      'Exceptional Match': {
        color: '#00ff88',
        description: 'Outstanding alignment with this role. Your resume strongly demonstrates the required qualifications.',
      },
      'Strong Match': {
        color: '#4ade80',
        description: 'Very strong alignment with this role. You meet most key requirements effectively.',
      },
      'Good Match': {
        color: '#86efac',
        description: 'Good alignment overall. A few targeted improvements could significantly boost your score.',
      },
      'Moderate Match': {
        color: '#fbbf24',
        description: 'Moderate alignment. There are meaningful gaps that should be addressed before applying.',
      },
      'Weak Match': {
        color: '#f97316',
        description: 'Weak alignment with this role. Significant skill development or resume improvements are needed.',
      },
      'Low Match': {
        color: '#ef4444',
        description: 'Low alignment detected. This role may require skills or experience not present in your resume.',
      },
    };

    return {
      score,
      matchLevel,
      color: breakdowns[matchLevel].color,
      description: breakdowns[matchLevel].description,
    };
  }

  validateCategoryScores(result: AnalysisResult): AnalysisResult {
    const cs = result.categoryScores;
    const total =
      cs.requiredSkills +
      cs.experience +
      cs.responsibilities +
      cs.technicalKeywords +
      cs.projects +
      cs.education +
      cs.atsReadability;

    // If category sum doesn't match overall score, normalize
    if (Math.abs(total - result.overallScore) > 5) {
      const ratio = result.overallScore / Math.max(total, 1);
      return {
        ...result,
        categoryScores: {
          requiredSkills: Math.round(Math.min(30, cs.requiredSkills * ratio)),
          experience: Math.round(Math.min(20, cs.experience * ratio)),
          responsibilities: Math.round(Math.min(15, cs.responsibilities * ratio)),
          technicalKeywords: Math.round(Math.min(15, cs.technicalKeywords * ratio)),
          projects: Math.round(Math.min(10, cs.projects * ratio)),
          education: Math.round(Math.min(5, cs.education * ratio)),
          atsReadability: Math.round(Math.min(5, cs.atsReadability * ratio)),
        },
      };
    }

    return result;
  }

  getCategoryPercentage(score: number, maxScore: number): number {
    return Math.round((score / maxScore) * 100);
  }

  getCategoryPercentages(categoryScores: AnalysisResult['categoryScores']): Record<string, number> {
    return {
      requiredSkills: this.getCategoryPercentage(categoryScores.requiredSkills, 30),
      experience: this.getCategoryPercentage(categoryScores.experience, 20),
      responsibilities: this.getCategoryPercentage(categoryScores.responsibilities, 15),
      technicalKeywords: this.getCategoryPercentage(categoryScores.technicalKeywords, 15),
      projects: this.getCategoryPercentage(categoryScores.projects, 10),
      education: this.getCategoryPercentage(categoryScores.education, 5),
      atsReadability: this.getCategoryPercentage(categoryScores.atsReadability, 5),
    };
  }
}
