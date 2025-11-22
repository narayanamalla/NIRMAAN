import { pipeline } from '@xenova/transformers';
import rubricData from '../../rubric.json';
import Sentiment from 'sentiment';

export interface AdvancedMetricScore {
  name: string;
  score: number;
  maxScore: number;
  details: string;
  nlpInsights?: {
    modelAnalysis?: string;
    recommendations?: string[];
    detectedIssues?: string[];
    detectedStrengths?: string[];
  };
}

export interface AdvancedCriterionScore {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  metrics: AdvancedMetricScore[];
}

export interface AdvancedScoreResult {
  overallScore: number;
  maxOverallScore: number;
  wordCount: number;
  duration: number;
  speechRate: number;
  criteria: AdvancedCriterionScore[];
  advancedInsights: {
    ruleBasedFeedback: string[];
    semanticFeedback: string[];
    nlpFeedback: string[];
    tieredRecommendations: {
      ruleBased: string[];
      semantic: string[];
      advancedNLP: string[];
    };
  };
  concisenessAnalysis?: {
    originalLength: number;
    summary: string;
    coreMessageDensity: number;
    missingKeywords: string[];
  };
}

export class AdvancedScoringEngine {
  private rubric: any;
  private sentiment: any;
  private transformersPipelines: Map<string, any> = new Map();

  constructor() {
    this.rubric = this.createEnhancedRubric();
    this.sentiment = new Sentiment();
  }

  private createEnhancedRubric() {
    const baseRubric = JSON.parse(JSON.stringify(rubricData));

    // Add Tone & Register criterion
    const toneRegisterCriterion = {
      name: "Tone & Register",
      weight: 0.10,
      metrics: [
        {
          name: "Politeness Level",
          scoringCriteria: {
            "Excellent": { "min": 0.8, "max": 1.0, "score": 10 },
            "Good": { "min": 0.6, "max": 0.79, "score": 8 },
            "Average": { "min": 0.4, "max": 0.59, "score": 6 },
            "Poor": { "min": 0.2, "max": 0.39, "score": 4 },
            "Very Poor": { "min": 0.0, "max": 0.19, "score": 2 }
          },
          weight: 10
        },
        {
          name: "Professionalism",
          scoringCriteria: {
            "Highly Professional": { "min": 0.8, "max": 1.0, "score": 10 },
            "Professional": { "min": 0.6, "max": 0.79, "score": 8 },
            "Semi-Professional": { "min": 0.4, "max": 0.59, "score": 6 },
            "Casual": { "min": 0.2, "max": 0.39, "score": 4 },
            "Too Informal": { "min": 0.0, "max": 0.19, "score": 2 }
          },
          weight: 10
        }
      ]
    };

    baseRubric.criteria.push(toneRegisterCriterion);
    return baseRubric;
  }

  private async getPipeline(task: string, model: string) {
    const key = `${task}-${model}`;
    if (!this.transformersPipelines.has(key)) {
      this.transformersPipelines.set(key, await pipeline(task as any, model));
    }
    return this.transformersPipelines.get(key);
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private calculateSpeechRate(wordCount: number, durationInSeconds: number): number {
    if (durationInSeconds <= 0) return 0;
    return Math.round((wordCount / durationInSeconds) * 60);
  }

  private async analyzePolitenessAndProfessionalism(text: string): Promise<{
    politenessScore: number;
    professionalismScore: number;
    insights: any;
  }> {
    try {
      // Use sentiment analysis as a proxy for professionalism assessment
      const sentimentResult = this.sentiment.analyze(text);

      // Calculate politeness indicators
      const politenessIndicators = [
        'please', 'thank', 'thanks', 'excuse me', 'sorry', 'pardon',
        'good morning', 'good afternoon', 'good evening', 'hello',
        'respect', 'appreciate', 'grateful', 'pleasure'
      ];

      const professionalIndicators = [
        'professional', 'experienced', 'skilled', 'qualified', 'expertise',
        'background', 'education', 'certified', 'trained', 'specialized',
        'achieved', 'accomplished', 'successfully', 'managed', 'led'
      ];

      const informalIndicators = [
        'guys', 'dude', 'bro', 'sis', 'awesome', 'cool', 'totally',
        'like', 'you know', 'stuff', 'things', 'kinda', 'sorta'
      ];

      const lowerText = text.toLowerCase();
      let politenessCount = 0;
      let professionalCount = 0;
      let informalCount = 0;

      politenessIndicators.forEach(indicator => {
        if (lowerText.includes(indicator)) politenessCount++;
      });

      professionalIndicators.forEach(indicator => {
        if (lowerText.includes(indicator)) professionalCount++;
      });

      informalIndicators.forEach(indicator => {
        if (lowerText.includes(indicator)) informalCount++;
      });

      // Calculate scores
      const politenessScore = Math.min(10, politenessCount * 2 + (sentimentResult.positive.length > 0 ? 2 : 0));
      const professionalismScore = Math.max(2, 10 - (informalCount * 2) + (professionalCount > 0 ? 2 : 0));

      return {
        politenessScore,
        professionalismScore,
        insights: {
          politenessIndicators: politenessCount,
          professionalIndicators: professionalCount,
          informalIndicators: informalCount,
          sentimentScore: sentimentResult.score,
          positiveWords: sentimentResult.positive.length,
          negativeWords: sentimentResult.negative.length
        }
      };

    } catch (error) {
      console.error('Politeness analysis error:', error);
      return {
        politenessScore: 5,
        professionalismScore: 5,
        insights: { error: 'Analysis failed' }
      };
    }
  }

  private async analyzeCoherence(text: string): Promise<{
    coherenceScore: number;
    insights: any;
  }> {
    try {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length < 2) {
        return {
          coherenceScore: 5,
          insights: { tooShort: true }
        };
      }

      // Simple coherence analysis using sentence similarity
      const classifier = await this.getPipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      const embeddings = await classifier(sentences);

      // Calculate coherence between consecutive sentences
      let coherenceSum = 0;
      let coherenceIssues = [];

      for (let i = 0; i < sentences.length - 1; i++) {
        const embedding1 = embeddings.data.slice(i * 384, (i + 1) * 384);
        const embedding2 = embeddings.data.slice((i + 1) * 384, (i + 2) * 384);

        // Calculate cosine similarity
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;

        for (let j = 0; j < embedding1.length; j++) {
          dotProduct += embedding1[j] * embedding2[j];
          norm1 += embedding1[j] * embedding1[j];
          norm2 += embedding2[j] * embedding2[j];
        }

        norm1 = Math.sqrt(norm1);
        norm2 = Math.sqrt(norm2);

        if (norm1 > 0 && norm2 > 0) {
          const similarity = dotProduct / (norm1 * norm2);
          coherenceSum += similarity;

          // Identify potential coherence issues
          if (similarity < 0.3) {
            coherenceIssues.push({
              sentenceIndex: i + 1,
              sentence: sentences[i + 1].trim(),
              similarity: similarity,
              issue: "Low coherence with previous sentence"
            });
          }
        }
      }

      const averageCoherence = coherenceSum / (sentences.length - 1);
      const coherenceScore = Math.round(averageCoherence * 10);

      return {
        coherenceScore: Math.max(2, Math.min(10, coherenceScore)),
        insights: {
          averageCoherence,
          coherenceIssues,
          sentenceCount: sentences.length,
          detailedScores: coherenceIssues.map(issue => ({
            sentence: issue.sentence.substring(0, 50) + (issue.sentence.length > 50 ? "..." : ""),
            score: issue.similarity
          }))
        }
      };

    } catch (error) {
      console.error('Coherence analysis error:', error);
      return {
        coherenceScore: 5,
        insights: { error: 'Coherence analysis failed' }
      };
    }
  }

  private async generateSummary(text: string): Promise<string> {
    try {
      // For now, use extractive summarization as a fallback
      // In a production environment, you'd use an abstractive model
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

      // Simple extractive summary - take the most informative sentences
      const scoredSentences = sentences.map((sentence, index) => {
        const lowerSentence = sentence.toLowerCase();
        let score = 0;

        // Boost sentences with important keywords
        const importantKeywords = ['name', 'goal', 'experience', 'skill', 'achievement', 'unique'];
        importantKeywords.forEach(keyword => {
          if (lowerSentence.includes(keyword)) score += 2;
        });

        // Position-based scoring (middle sentences often most important)
        const positionScore = 1 - Math.abs(index - sentences.length / 2) / (sentences.length / 2);
        score += positionScore;

        return { sentence: sentence.trim(), score, index };
      });

      // Sort by score and take top 3-4 sentences
      scoredSentences.sort((a, b) => b.score - a.score);
      const topSentences = scoredSentences.slice(0, Math.min(4, sentences.length))
        .sort((a, b) => a.index - b.index);

      return topSentences.map(s => s.sentence).join('. ') + '.';

    } catch (error) {
      console.error('Summarization error:', error);
      return text.substring(0, 200) + '...';
    }
  }

  private async analyzeCoreMessageDensity(transcript: string, summary: string, requiredKeywords: string[]): Promise<{
    densityScore: number;
    missingKeywords: string[];
    insights: any;
  }> {
    const summaryLower = summary.toLowerCase();
    const missingKeywords = requiredKeywords.filter(keyword =>
      !summaryLower.includes(keyword.toLowerCase())
    );

    const densityScore = Math.max(0, 10 - (missingKeywords.length * 2));

    return {
      densityScore,
      missingKeywords,
      insights: {
        summaryLength: summary.length,
        originalLength: transcript.length,
        compressionRatio: summary.length / transcript.length,
        keywordCoverage: (requiredKeywords.length - missingKeywords.length) / requiredKeywords.length
      }
    };
  }

  private async calculateAdvancedToneAndRegisterScore(text: string): Promise<AdvancedMetricScore[]> {
    const analysis = await this.analyzePolitenessAndProfessionalism(text);

    const politenessMetric: AdvancedMetricScore = {
      name: "Politeness Level",
      score: analysis.politenessScore,
      maxScore: 10,
      details: `${analysis.politenessScore}/10 politeness detected`,
      nlpInsights: {
        modelAnalysis: `Detected ${analysis.insights.politenessIndicators} politeness indicators and ${analysis.insights.positiveWords} positive words`,
        recommendations: analysis.politenessScore < 6 ? [
          "Add polite greetings like 'Good morning' or 'Hello everyone'",
          "Include expressions of gratitude like 'Thank you for listening'",
          "Use formal closing statements"
        ] : [],
        detectedStrengths: analysis.politenessScore >= 8 ? [
          "Good use of polite expressions",
          "Positive tone detected",
          "Professional register maintained"
        ] : [],
        detectedIssues: analysis.politenessScore < 6 ? [
          "Insufficient politeness indicators",
          "Could benefit from more formal language"
        ] : []
      }
    };

    const professionalismMetric: AdvancedMetricScore = {
      name: "Professionalism",
      score: analysis.professionalismScore,
      maxScore: 10,
      details: `${analysis.professionalismScore}/10 professional level`,
      nlpInsights: {
        modelAnalysis: `Detected ${analysis.insights.professionalIndicators} professional indicators and ${analysis.insights.informalIndicators} informal expressions`,
        recommendations: analysis.professionalismScore < 6 ? [
          "Replace informal expressions with professional alternatives",
          "Use industry-appropriate terminology",
          "Maintain consistent formal tone"
        ] : [],
        detectedStrengths: analysis.professionalismScore >= 8 ? [
          "Professional language use",
          "Appropriate formality level",
          "Consistent professional tone"
        ] : [],
        detectedIssues: analysis.professionalismScore < 6 ? [
          "Too informal expressions detected",
          "Could use more professional language"
        ] : []
      }
    };

    return [politenessMetric, professionalismMetric];
  }

  private async calculateAdvancedFlowAndCoherenceScore(text: string): Promise<AdvancedMetricScore> {
    const basicFlow = this.calculateBasicFlow(text);
    const coherenceAnalysis = await this.analyzeCoherence(text);

    const flowScore = Math.round((basicFlow.score + coherenceAnalysis.coherenceScore) / 2);

    return {
      name: "Flow & Coherence",
      score: flowScore,
      maxScore: 10,
      details: `${flowScore}/10 - Basic flow: ${basicFlow.score}/10, Coherence: ${coherenceAnalysis.coherenceScore}/10`,
      nlpInsights: {
        modelAnalysis: `Discourse coherence analysis shows ${coherenceAnalysis.insights.averageCoherence?.toFixed(2) || 'N/A'} average similarity between sentences`,
        recommendations: coherenceAnalysis.insights.coherenceIssues?.length > 0 ? [
          ...coherenceAnalysis.insights.coherenceIssues.slice(0, 2).map(issue =>
            `Consider improving the transition: "${issue.sentence.substring(0, 50)}..."`
          ),
          "Add transition phrases between topics",
          "Ensure smooth logical flow between ideas"
        ] : [],
        detectedStrengths: coherenceAnalysis.coherenceScore >= 8 ? [
          "Good logical flow between sentences",
          "Well-structured discourse",
          "Coherent narrative progression"
        ] : [],
        detectedIssues: coherenceAnalysis.insights.coherenceIssues?.map(issue =>
          `Sentence ${issue.sentenceIndex + 1} has low coherence (${(issue.similarity * 100).toFixed(0)}% similarity)`
        ) || []
      }
    };
  }

  private calculateBasicFlow(text: string): { score: number; details: string } {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const lowerText = text.toLowerCase();

    let hasSalutation = false;
    let hasBasicDetails = false;
    let hasAdditionalDetails = false;
    let hasClosing = false;

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

    return { score, details };
  }

  async scoreTranscriptAdvanced(transcript: string, durationInSeconds: number = 0): Promise<AdvancedScoreResult> {
    if (!transcript.trim()) {
      return {
        overallScore: 0,
        maxOverallScore: 100,
        wordCount: 0,
        duration: durationInSeconds,
        speechRate: 0,
        criteria: [],
        advancedInsights: {
          ruleBasedFeedback: ["No transcript provided"],
          semanticFeedback: [],
          nlpFeedback: [],
          tieredRecommendations: {
            ruleBased: ["Please enter a transcript to score"],
            semantic: [],
            advancedNLP: []
          }
        }
      };
    }

    const wordCount = this.countWords(transcript);
    const speechRate = this.calculateSpeechRate(wordCount, durationInSeconds);

    // Advanced NLP Analysis
    const summary = await this.generateSummary(transcript);
    const requiredKeywords = ["name", "age", "goal", "experience", "skill", "family", "interests"];
    const densityAnalysis = await this.analyzeCoreMessageDensity(transcript, summary, requiredKeywords);

    // Enhanced metric calculations
    const contentStructureMetrics: AdvancedMetricScore[] = [
      this.calculateSalutationScore(transcript),
      this.calculateKeywordScore(transcript),
      await this.calculateAdvancedFlowAndCoherenceScore(transcript)
    ];

    // Add new Tone & Register metrics
    const toneRegisterMetrics = await this.calculateAdvancedToneAndRegisterScore(transcript);

    const languageGrammarMetrics: AdvancedMetricScore[] = [
      this.calculateGrammarScore(transcript, wordCount),
      this.calculateVocabularyRichness(transcript)
    ];

    const clarityMetrics: AdvancedMetricScore[] = [
      this.calculateClarityScore(transcript)
    ];

    const engagementMetrics: AdvancedMetricScore[] = [
      this.calculateEngagementScore(transcript)
    ];

    const speechRateMetrics: AdvancedMetricScore[] = [
      this.calculateSpeechRateScore(speechRate)
    ];

    const criteria: AdvancedCriterionScore[] = [
      {
        name: 'Content & Structure',
        score: contentStructureMetrics.reduce((sum, m) => sum + m.score, 0),
        maxScore: 40,
        weight: 0.35, // Reduced weight slightly for new criterion
        metrics: contentStructureMetrics
      },
      {
        name: 'Tone & Register',
        score: toneRegisterMetrics.reduce((sum, m) => sum + m.score, 0),
        maxScore: 20,
        weight: 0.10,
        metrics: toneRegisterMetrics
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
        weight: 0.10, // Reduced weight slightly
        metrics: engagementMetrics
      }
    ];

    const overallScore = criteria.reduce((total, criterion) => {
      return total + (criterion.score * criterion.weight);
    }, 0);

    // Generate tiered recommendations
    const recommendations = this.generateTieredRecommendations(criteria, densityAnalysis, speechRate);

    return {
      overallScore: Math.round(overallScore),
      maxOverallScore: 100,
      wordCount,
      duration: durationInSeconds,
      speechRate,
      criteria,
      advancedInsights: recommendations,
      concisenessAnalysis: densityAnalysis
    };
  }

  private generateTieredRecommendations(criteria: AdvancedCriterionScore[], densityAnalysis: any, speechRate: number) {
    const ruleBasedFeedback: string[] = [];
    const semanticFeedback: string[] = [];
    const nlpFeedback: string[] = [];

    // Rule-based recommendations
    criteria.forEach(criterion => {
      criterion.metrics.forEach(metric => {
        if (metric.score < metric.maxScore * 0.7) {
          ruleBasedFeedback.push(`${metric.name}: Only scored ${metric.score}/${metric.maxScore}`);
        }
      });
    });

    // Semantic feedback
    if (speechRate > 160) {
      semanticFeedback.push("Speech rate too fast - aim for 111-140 WPM");
    } else if (speechRate < 80) {
      semanticFeedback.push("Speech rate too slow - aim for 111-140 WPM");
    }

    // Advanced NLP feedback
    criteria.forEach(criterion => {
      criterion.metrics.forEach(metric => {
        if (metric.nlpInsights?.recommendations) {
          nlpFeedback.push(...metric.nlpInsights.recommendations);
        }
      });
    });

    // Core message density feedback
    if (densityAnalysis.missingKeywords.length > 0) {
      nlpFeedback.push(`Core message missing key elements: ${densityAnalysis.missingKeywords.join(', ')}`);
    }

    return {
      ruleBasedFeedback,
      semanticFeedback,
      nlpFeedback,
      tieredRecommendations: {
        ruleBased: ruleBasedFeedback,
        semantic: semanticFeedback,
        advancedNLP: nlpFeedback
      }
    };
  }

  // Keep existing methods for backward compatibility
  private calculateSalutationScore(text: string): AdvancedMetricScore {
    const lowerText = text.toLowerCase();

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

  private calculateKeywordScore(text: string): AdvancedMetricScore {
    const lowerText = text.toLowerCase();
    const keywordMetric = this.rubric.criteria[0].metrics[1];

    let mustHaveScore = 0;
    const foundMustHave: string[] = [];
    let goodToHaveScore = 0;
    const foundGoodToHave: string[] = [];

    for (const keyword of keywordMetric.mustHave.keywords) {
      if (lowerText.includes(keyword)) {
        mustHaveScore += keywordMetric.mustHave.scoreEach;
        foundMustHave.push(keyword);
      }
    }
    mustHaveScore = Math.min(mustHaveScore, keywordMetric.mustHave.maxScore);

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
      details,
      nlpInsights: {
        modelAnalysis: `Found ${foundMustHave.length} must-have and ${foundGoodToHave.length} good-to-have keywords`,
        recommendations: mustHaveScore < 20 ? [
          "Include your name, age, class, and school",
          "Mention your family and hobbies/interests"
        ] : [],
        detectedStrengths: foundMustHave.length > 3 ? [
          "Good coverage of must-have keywords",
          "Comprehensive personal information provided"
        ] : []
      }
    };
  }

  private calculateSpeechRateScore(speechRate: number): AdvancedMetricScore {
    const speechRateMetric = this.rubric.criteria[1].scoringCriteria;

    for (const [level, config] of Object.entries(speechRateMetric)) {
      if (speechRate >= (config as any).min && speechRate <= (config as any).max) {
        return {
          name: 'Speech Rate',
          score: (config as any).score,
          maxScore: 10,
          details: `${level}: ${speechRate} WPM`,
          nlpInsights: {
            modelAnalysis: `Speech rate analysis indicates ${level} speaking pace at ${speechRate} words per minute`,
            recommendations: speechRate > 140 ? [
              "Consider speaking slightly slower for better clarity",
              "Add brief pauses between key points"
            ] : speechRate < 111 ? [
              "Consider speaking slightly faster to maintain engagement",
              "Practice with a metronome to improve pacing"
            ] : [],
            detectedStrengths: speechRate >= 111 && speechRate <= 140 ? [
              "Optimal speech rate for engagement and clarity"
            ] : []
          }
        };
      }
    }

    return { name: 'Speech Rate', score: 2, maxScore: 10, details: 'Too slow or too fast' };
  }

  private calculateGrammarScore(text: string, wordCount: number): AdvancedMetricScore {
    const commonErrors = [
      /\ba\s+\s+/g,
      /\s+\s+b/g,
      /[,.]{2,}/g,
      /\b(im|you|he|she|it|we|they)s\b/gi
    ];

    let errorCount = 0;
    for (const pattern of commonErrors) {
      const matches = text.match(pattern);
      if (matches) errorCount += matches.length;
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.trim().split(/\s+/);

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 0 && !trimmed.match(/^[A-Z]/)) {
        errorCount++;
      }
    }

    const errorsPer100Words = wordCount > 0 ? (errorCount / wordCount) * 100 : 0;
    const grammarScore = Math.max(0, 1 - Math.min(errorsPer100Words / 10, 1));

    const grammarMetric = this.rubric.criteria[3].metrics[0].scoringCriteria;
    for (const [level, config] of Object.entries(grammarMetric)) {
      if (grammarScore >= (config as any).min && grammarScore <= (config as any).max) {
        return {
          name: 'Grammar Errors',
          score: (config as any).score,
          maxScore: 10,
          details: `${level}: ${errorCount} errors detected, score: ${grammarScore.toFixed(2)}`,
          nlpInsights: {
            modelAnalysis: `Grammar analysis revealed ${errorCount} issues in ${wordCount} words (${errorsPer100Words.toFixed(1)} errors per 100 words)`,
            recommendations: errorCount > 2 ? [
              "Check for proper capitalization at sentence beginnings",
              "Review for double spaces or punctuation",
              "Ensure proper verb usage and sentence structure"
            ] : [],
            detectedStrengths: errorCount === 0 ? [
              "Excellent grammar with no detected errors",
              "Professional level writing quality"
            ] : []
          }
        };
      }
    }

    return { name: 'Grammar Errors', score: 2, maxScore: 10, details: 'Poor: Many errors detected' };
  }

  private calculateVocabularyRichness(text: string): AdvancedMetricScore {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const uniqueWords = [...new Set(words)];
    const ttr = words.length > 0 ? uniqueWords.length / words.length : 0;

    const ttrMetric = this.rubric.criteria[3].metrics[1].scoringCriteria;
    for (const [level, config] of Object.entries(ttrMetric)) {
      if (ttr >= (config as any).min && ttr <= (config as any).max) {
        return {
          name: 'Vocabulary Richness (TTR)',
          score: (config as any).score,
          maxScore: 10,
          details: `${level}: TTR = ${ttr.toFixed(2)} (${uniqueWords.length}/${words.length})`,
          nlpInsights: {
            modelAnalysis: `Type-Token Ratio analysis shows ${ttr.toFixed(3)} vocabulary diversity with ${uniqueWords.length} unique words from ${words.length} total words`,
            recommendations: ttr < 0.5 ? [
              "Use a wider variety of vocabulary",
              "Avoid repetitive words and phrases",
              "Introduce synonyms for commonly used terms"
            ] : [],
            detectedStrengths: ttr >= 0.7 ? [
              "Excellent vocabulary diversity",
              "Rich lexical variety"
            ] : []
          }
        };
      }
    }

    return { name: 'Vocabulary Richness (TTR)', score: 2, maxScore: 10, details: 'Poor vocabulary diversity' };
  }

  private calculateClarityScore(text: string): AdvancedMetricScore {
    const words = text.toLowerCase().split(/\s+/);
    const fillerWordsMetric = this.rubric.criteria[4];
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
          details: `${level}: ${fillerCount} filler words, ${fillerRate.toFixed(1)}% rate`,
          nlpInsights: {
            modelAnalysis: `Clarity analysis detected ${fillerCount} filler words (${fillerRate.toFixed(1)}% filler rate) out of ${words.length} total words`,
            recommendations: fillerRate > 6 ? [
              "Practice speaking without filler words",
              "Record yourself and count filler usage",
              "Use brief pauses instead of filler words"
            ] : [],
            detectedStrengths: fillerRate <= 3 ? [
              "Excellent clarity with minimal filler words",
              "Confident and articulate speech"
            ] : []
          }
        };
      }
    }

    return { name: 'Filler Word Rate', score: 3, maxScore: 15, details: 'Poor: Too many filler words' };
  }

  private calculateEngagementScore(text: string): AdvancedMetricScore {
    const sentimentResult = this.sentiment.analyze(text);
    const positivityScore = sentimentResult.positive.length > 0 ?
      sentimentResult.positive.length / (sentimentResult.positive.length + sentimentResult.negative.length) : 0.5;

    const engagementMetric = this.rubric.criteria[5].scoringCriteria;
    for (const [level, config] of Object.entries(engagementMetric)) {
      if (positivityScore >= (config as any).min && positivityScore <= (config as any).max) {
        return {
          name: 'Sentiment/Positivity',
          score: (config as any).score,
          maxScore: 15,
          details: `${level}: positivity score ${positivityScore.toFixed(2)}, positive words: ${sentimentResult.positive.length}, negative: ${sentimentResult.negative.length}`,
          nlpInsights: {
            modelAnalysis: `Sentiment analysis shows ${positivityScore.toFixed(2)} positivity with ${sentimentResult.positive.length} positive and ${sentimentResult.negative.length} negative words`,
            recommendations: positivityScore < 0.6 ? [
              "Add more positive language and enthusiasm",
              "Include expressions of excitement or gratitude",
              "Focus on strengths and achievements"
            ] : [],
            detectedStrengths: positivityScore >= 0.8 ? [
              "Excellent positive sentiment",
              "Engaging and enthusiastic tone",
              "Good emotional connection"
            ] : []
          }
        };
      }
    }

    return { name: 'Sentiment/Positivity', score: 3, maxScore: 15, details: 'Poor: Negative or neutral tone' };
  }
}