import { pipeline } from '@xenova/transformers';
import rubricData from '../../rubric.json';

export interface RubricCriterion {
  name: string;
  description: string;
  weight: number;
  keywords: string[];
  minWords: number;
  maxWords: number;
}

export interface Rubric {
  title: string;
  criteria: RubricCriterion[];
}

export interface CriterionScore {
  name: string;
  score: number;
  weight: number;
  semanticSimilarity: number;
  keywordsFound: string[];
  feedback: string;
}

export interface ScoreResult {
  overallScore: number;
  wordCount: number;
  criteria: CriterionScore[];
}

export class ScoringEngine {
  private rubric: Rubric;
  private pipeline: any = null;

  constructor() {
    this.rubric = rubricData as Rubric;
  }

  async initializePipeline(): Promise<void> {
    if (!this.pipeline) {
      this.pipeline = await Pipeline.getInstance('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private findKeywords(text: string, keywords: string[]): string[] {
    const lowerText = text.toLowerCase();
    return keywords.filter(keyword =>
      lowerText.includes(keyword.toLowerCase())
    );
  }

  private async calculateSemanticSimilarity(text1: string, text2: string): Promise<number> {
    if (!this.pipeline) {
      await this.initializePipeline();
    }

    const embeddings = await this.pipeline([text1, text2]);
    const embedding1 = embeddings.data.slice(0, 384);
    const embedding2 = embeddings.data.slice(384, 768);

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (norm1 * norm2);
  }

  private calculateWordCountScore(wordCount: number, minWords: number, maxWords: number): number {
    if (wordCount >= minWords && wordCount <= maxWords) {
      return 100;
    } else if (wordCount < minWords) {
      const ratio = wordCount / minWords;
      return Math.max(0, ratio * 80);
    } else {
      const excess = wordCount - maxWords;
      const penalty = Math.min(50, (excess / maxWords) * 50);
      return Math.max(50, 100 - penalty);
    }
  }

  private generateFeedback(
    criterion: RubricCriterion,
    score: number,
    wordCountScore: number,
    semanticSimilarity: number,
    keywordsFound: string[]
  ): string {
    const feedback: string[] = [];

    if (score >= 80) {
      feedback.push(`Excellent ${criterion.name.toLowerCase()}.`);
    } else if (score >= 60) {
      feedback.push(`Good ${criterion.name.toLowerCase()}, but there's room for improvement.`);
    } else {
      feedback.push(`${criterion.name} needs significant improvement.`);
    }

    if (keywordsFound.length > 0) {
      feedback.push(`Found relevant keywords: ${keywordsFound.join(', ')}.`);
    } else if (criterion.keywords.length > 0) {
      feedback.push(`Consider incorporating keywords like: ${criterion.keywords.slice(0, 3).join(', ')}.`);
    }

    if (wordCountScore < 80) {
      if (wordCount < criterion.minWords) {
        feedback.push(`Text is too short (${wordCount} words, minimum ${criterion.minWords}).`);
      } else if (wordCount > criterion.maxWords) {
        feedback.push(`Text is too long (${wordCount} words, maximum ${criterion.maxWords}).`);
      }
    }

    if (semanticSimilarity < 0.5) {
      feedback.push(`Content could be more aligned with ${criterion.name.toLowerCase()}.`);
    }

    return feedback.join(' ');
  }

  async scoreTranscript(transcript: string): Promise<ScoreResult> {
    if (!transcript.trim()) {
      return {
        overallScore: 0,
        wordCount: 0,
        criteria: this.rubric.criteria.map(criterion => ({
          name: criterion.name,
          score: 0,
          weight: criterion.weight,
          semanticSimilarity: 0,
          keywordsFound: [],
          feedback: 'No transcript provided.'
        }))
      };
    }

    const wordCount = this.countWords(transcript);
    const criteriaScores: CriterionScore[] = [];

    await this.initializePipeline();

    for (const criterion of this.rubric.criteria) {
      const keywordsFound = this.findKeywords(transcript, criterion.keywords);
      const keywordScore = keywordsFound.length > 0 ? (keywordsFound.length / criterion.keywords.length) * 100 : 0;

      const semanticSimilarity = await this.calculateSemanticSimilarity(transcript, criterion.description);
      const semanticScore = semanticSimilarity * 100;

      const wordCountScore = this.calculateWordCountScore(wordCount, criterion.minWords, criterion.maxWords);

      const combinedScore = (
        keywordScore * 0.3 +
        semanticScore * 0.4 +
        wordCountScore * 0.3
      );

      const feedback = this.generateFeedback(
        criterion,
        combinedScore,
        wordCountScore,
        semanticSimilarity,
        keywordsFound
      );

      criteriaScores.push({
        name: criterion.name,
        score: Math.round(combinedScore),
        weight: criterion.weight,
        semanticSimilarity: Math.round(semanticSimilarity * 100) / 100,
        keywordsFound,
        feedback
      });
    }

    const overallScore = criteriaScores.reduce((total, criterion) => {
      return total + (criterion.score * criterion.weight);
    }, 0);

    return {
      overallScore: Math.round(overallScore),
      wordCount,
      criteria: criteriaScores
    };
  }
}