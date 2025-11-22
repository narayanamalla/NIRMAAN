import rubricData from '../../rubric.json';
import Sentiment from 'sentiment';

export interface MetricScore {
  name: string;
  score: number;
  maxScore: number;
  details: string;
}

export interface CriterionScore {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  metrics: MetricScore[];
}

export interface ScoreResult {
  overallScore: number;
  maxOverallScore: number;
  wordCount: number;
  duration: number;
  speechRate: number;
  criteria: CriterionScore[];
}

export class ScoringEngine {
  private rubric: any;
  private sentiment: any;

  constructor() {
    this.rubric = rubricData;
    this.sentiment = new Sentiment();
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private countSentences(text: string): number {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  }

  private calculateSpeechRate(wordCount: number, durationInSeconds: number): number {
    if (durationInSeconds <= 0) return 0;
    return Math.round((wordCount / durationInSeconds) * 60);
  }

  private calculateSalutationScore(text: string): MetricScore {
    const lowerText = text.toLowerCase();
    const salutationMetric = this.rubric.criteria[0].metrics[0];

    if (lowerText.includes('excited') || lowerText.includes('feeling great')) {
      return { name: 'Salutation Level', score: 5, maxScore: 5, details: 'Excellent - Shows enthusiasm' };
    } else if (lowerText.includes('good morning') || lowerText.includes('good afternoon') ||
               lowerText.includes('good evening') || lowerText.includes('good day') ||
               lowerText.includes('hello everyone')) {
      return { name: 'Salutation Level', score: 4, maxScore: 5, details: 'Good - Professional greeting' };
    } else if (lowerText.includes('hello') || lowerText.includes('hi')) {
      return { name: 'Salutation Level', score: 2, maxScore: 5, details: 'Normal - Basic greeting' };
    } else {
      return { name: 'Salutation Level', score: 0, maxScore: 5, details: 'No salutation detected' };
    }
  }

  private calculateKeywordScore(text: string): MetricScore {
    const lowerText = text.toLowerCase();
    const keywordMetric = this.rubric.criteria[0].metrics[1];

    let mustHaveScore = 0;
    const foundMustHave: string[] = [];
    let goodToHaveScore = 0;
    const foundGoodToHave: string[] = [];

    // Check must-have keywords
    for (const keyword of keywordMetric.mustHave.keywords) {
      if (lowerText.includes(keyword)) {
        mustHaveScore += keywordMetric.mustHave.scoreEach;
        foundMustHave.push(keyword);
      }
    }
    mustHaveScore = Math.min(mustHaveScore, keywordMetric.mustHave.maxScore);

    // Check good-to-have keywords
    for (const keyword of keywordMetric.goodToHave.keywords) {
      if (lowerText.includes(keyword)) {
        goodToHaveScore += keywordMetric.goodToHave.scoreEach;
        foundGoodToHave.push(keyword);
      }
    }
    goodToHaveScore = Math.min(goodToHaveScore, keywordMetric.goodToHave.maxScore);

    const totalScore = mustHaveScore + goodToHaveScore;
    const details = `Must-have found: [${foundMustHave.join(', ')}] (${mustHaveScore}/20), Good-to-have found: [${foundGoodToHave.join(', ')}] (${goodToHaveScore}/10)`;

    return {
      name: 'Key Word Presence',
      score: totalScore,
      maxScore: 30,
      details
    };
  }

  private calculateFlowScore(text: string): MetricScore {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const lowerText = text.toLowerCase();

    let hasSalutation = false;
    let hasBasicDetails = false;
    let hasAdditionalDetails = false;
    let hasClosing = false;

    // Simple flow detection
    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('good')) {
      hasSalutation = true;
    }

    if (lowerText.includes('years old') || lowerText.includes('class') || lowerText.includes('school')) {
      hasBasicDetails = true;
    }

    if (lowerText.includes('family') || lowerText.includes('hobby') || lowerText.includes('interest') || lowerText.includes('fact')) {
      hasAdditionalDetails = true;
    }

    if (lowerText.includes('thank you') || lowerText.includes('that')) {
      hasClosing = true;
    }

    const score = (hasSalutation && hasBasicDetails && hasAdditionalDetails && hasClosing) ? 5 : 0;
    const details = score === 5 ? 'Proper flow followed' : 'Flow needs improvement';

    return { name: 'Flow', score, maxScore: 5, details };
  }

  private calculateSpeechRateScore(speechRate: number): MetricScore {
    const speechRateMetric = this.rubric.criteria[1].scoringCriteria;

    for (const [level, config] of Object.entries(speechRateMetric)) {
      if (speechRate >= (config as any).min && speechRate <= (config as any).max) {
        return {
          name: 'Speech Rate',
          score: (config as any).score,
          maxScore: 10,
          details: `${level}: ${speechRate} WPM`
        };
      }
    }

    return { name: 'Speech Rate', score: 2, maxScore: 10, details: 'Too slow or too fast' };
  }

  private calculateGrammarScore(text: string, wordCount: number): MetricScore {
    // Simple grammar error detection (basic approximation)
    const commonErrors = [
      /\ba\s+\s+/g, // double spaces
      /\s+\s+b/g,
      /[,.]{2,}/g, // multiple punctuation
      /\b(im|you|he|she|it|we|they)s\b/gi // incorrect verb forms
    ];

    let errorCount = 0;
    for (const pattern of commonErrors) {
      const matches = text.match(pattern);
      if (matches) errorCount += matches.length;
    }

    // Basic grammar rules
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.trim().split(/\s+/);

    // Check for basic sentence structure
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 0 && !trimmed.match(/^[A-Z]/)) {
        errorCount++; // Sentence doesn't start with capital
      }
    }

    const errorsPer100Words = wordCount > 0 ? (errorCount / wordCount) * 100 : 0;
    const grammarScore = Math.max(0, 1 - Math.min(errorsPer100Words / 10, 1));

    const grammarMetric = this.rubric.criteria[2].metrics[0].scoringCriteria;
    for (const [level, config] of Object.entries(grammarMetric)) {
      if (grammarScore >= (config as any).min && grammarScore <= (config as any).max) {
        return {
          name: 'Grammar Errors',
          score: (config as any).score,
          maxScore: 10,
          details: `${level}: ${errorCount} errors detected, score: ${grammarScore.toFixed(2)}`
        };
      }
    }

    return { name: 'Grammar Errors', score: 2, maxScore: 10, details: 'Poor: Many errors detected' };
  }

  private calculateVocabularyRichness(text: string): MetricScore {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const uniqueWords = [...new Set(words)];
    const ttr = words.length > 0 ? uniqueWords.length / words.length : 0;

    const ttrMetric = this.rubric.criteria[2].metrics[1].scoringCriteria;
    for (const [level, config] of Object.entries(ttrMetric)) {
      if (ttr >= (config as any).min && ttr <= (config as any).max) {
        return {
          name: 'Vocabulary Richness (TTR)',
          score: (config as any).score,
          maxScore: 10,
          details: `${level}: TTR = ${ttr.toFixed(2)} (${uniqueWords.length}/${words.length})`
        };
      }
    }

    return { name: 'Vocabulary Richness (TTR)', score: 2, maxScore: 10, details: 'Poor vocabulary diversity' };
  }

  private calculateClarityScore(text: string): MetricScore {
    const words = text.toLowerCase().split(/\s+/);
    const fillerWordsMetric = this.rubric.criteria[3];
    let fillerCount = 0;

    for (const fillerWord of fillerWordsMetric.fillerWords) {
      fillerCount += words.filter(word => word.includes(fillerWord)).length;
    }

    const fillerRate = words.length > 0 ? (fillerCount / words.length) * 100 : 0;

    const clarityMetric = fillerWordsMetric.scoringCriteria;
    for (const [level, config] of Object.entries(clarityMetric)) {
      if (fillerRate >= (config as any).min && fillerRate <= (config as any).max) {
        return {
          name: 'Filler Word Rate',
          score: (config as any).score,
          maxScore: 15,
          details: `${level}: ${fillerCount} filler words, ${fillerRate.toFixed(1)}% rate`
        };
      }
    }

    return { name: 'Filler Word Rate', score: 3, maxScore: 15, details: 'Poor: Too many filler words' };
  }

  private calculateEngagementScore(text: string): MetricScore {
    const sentimentResult = this.sentiment.analyze(text);
    const positivityScore = sentimentResult.positive.length > 0 ?
      sentimentResult.positive.length / (sentimentResult.positive.length + sentimentResult.negative.length) : 0.5;

    const engagementMetric = this.rubric.criteria[4].scoringCriteria;
    for (const [level, config] of Object.entries(engagementMetric)) {
      if (positivityScore >= (config as any).min && positivityScore <= (config as any).max) {
        return {
          name: 'Sentiment/Positivity',
          score: (config as any).score,
          maxScore: 15,
          details: `${level}: positivity score ${positivityScore.toFixed(2)}, positive words: ${sentimentResult.positive.length}, negative: ${sentimentResult.negative.length}`
        };
      }
    }

    return { name: 'Sentiment/Positivity', score: 3, maxScore: 15, details: 'Poor: Negative or neutral tone' };
  }

  async scoreTranscript(transcript: string, durationInSeconds: number = 0): Promise<ScoreResult> {
    if (!transcript.trim()) {
      return {
        overallScore: 0,
        maxOverallScore: 100,
        wordCount: 0,
        duration: durationInSeconds,
        speechRate: 0,
        criteria: []
      };
    }

    const wordCount = this.countWords(transcript);
    const speechRate = this.calculateSpeechRate(wordCount, durationInSeconds);

    const contentStructureMetrics: MetricScore[] = [
      this.calculateSalutationScore(transcript),
      this.calculateKeywordScore(transcript),
      this.calculateFlowScore(transcript)
    ];

    const languageGrammarMetrics: MetricScore[] = [
      this.calculateGrammarScore(transcript, wordCount),
      this.calculateVocabularyRichness(transcript)
    ];

    const clarityMetrics: MetricScore[] = [
      this.calculateClarityScore(transcript)
    ];

    const engagementMetrics: MetricScore[] = [
      this.calculateEngagementScore(transcript)
    ];

    const speechRateMetrics: MetricScore[] = [
      this.calculateSpeechRateScore(speechRate)
    ];

    const criteria: CriterionScore[] = [
      {
        name: 'Content & Structure',
        score: contentStructureMetrics.reduce((sum, m) => sum + m.score, 0),
        maxScore: 40,
        weight: 0.40,
        metrics: contentStructureMetrics
      },
      {
        name: 'Speech Rate',
        score: speechRateMetrics.reduce((sum, m) => sum + m.score, 0),
        maxScore: 10,
        weight: 0.10,
        metrics: speechRateMetrics
      },
      {
        name: 'Language & Grammar',
        score: languageGrammarMetrics.reduce((sum, m) => sum + m.score, 0),
        maxScore: 20,
        weight: 0.20,
        metrics: languageGrammarMetrics
      },
      {
        name: 'Clarity',
        score: clarityMetrics.reduce((sum, m) => sum + m.score, 0),
        maxScore: 15,
        weight: 0.15,
        metrics: clarityMetrics
      },
      {
        name: 'Engagement',
        score: engagementMetrics.reduce((sum, m) => sum + m.score, 0),
        maxScore: 15,
        weight: 0.15,
        metrics: engagementMetrics
      }
    ];

    const overallScore = criteria.reduce((total, criterion) => {
      return total + (criterion.score * criterion.weight);
    }, 0);

    const maxOverallScore = 100; // Based on rubric weights

    return {
      overallScore: Math.round(overallScore),
      maxOverallScore,
      wordCount,
      duration: durationInSeconds,
      speechRate,
      criteria
    };
  }
}