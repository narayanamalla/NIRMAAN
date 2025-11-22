// Hugging Face API Integration for Professional Introduction Scoring
// Uses server-side Hugging Face APIs for accurate grading

export interface HFScoringResult {
  score: number;
  maxScore: number;
  grade: string;
  feedback: string[];
  strengths: string[];
  improvements: string[];
  confidence: number;
  analysis: {
    clarity: number;
    completeness: number;
    professionalism: number;
    engagement: number;
    structure: number;
  };
}

export class HuggingFaceScoringEngine {
  private readonly HF_API_URL = 'https://api-inference.huggingface.co/models';
  private readonly HF_TOKEN: string;

  constructor() {
    // Note: In production, this should be set as environment variable
    this.HF_TOKEN = process.env.HUGGINGFACE_API_KEY || '';
  }

  /**
   * Score a self-introduction using multiple Hugging Face models
   */
  async scoreIntroduction(transcript: string, duration?: number): Promise<HFScoringResult> {
    try {
      // Use multiple models for comprehensive analysis
      const [
        sentimentResult,
        classificationResult,
        clarityResult,
        professionalismResult
      ] = await Promise.all([
        this.analyzeSentiment(transcript),
        this.classifyIntroduction(transcript),
        this.analyzeClarity(transcript),
        this.analyzeProfessionalism(transcript)
      ]);

      // Calculate comprehensive scores
      const analysis = {
        clarity: clarityResult.score,
        completeness: this.calculateCompleteness(transcript),
        professionalism: professionalismResult.score,
        engagement: sentimentResult.engagement,
        structure: this.analyzeStructure(transcript)
      };

      // Calculate overall score
      const overallScore = this.calculateOverallScore(analysis);
      const { grade, feedback, strengths, improvements } = this.generateFeedback(
        overallScore,
        analysis,
        transcript
      );

      return {
        score: overallScore,
        maxScore: 100,
        grade,
        feedback,
        strengths,
        improvements,
        confidence: this.calculateConfidence([sentimentResult, classificationResult, clarityResult, professionalismResult]),
        analysis
      };

    } catch (error) {
      console.error('Hugging Face scoring error:', error);
      // Fallback to basic scoring
      return this.fallbackScoring(transcript);
    }
  }

  private async analyzeSentiment(text: string) {
    try {
      // Using a sentiment analysis model
      const response = await fetch(`${this.HF_API_URL}/cardiffnlp/twitter-roberta-base-sentiment-latest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text })
      });

      const result = await response.json();

      // Process sentiment result
      const sentimentScore = this.processSentimentResult(result);
      const engagement = this.calculateEngagement(text);

      return { score: sentimentScore, engagement, raw: result };
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return { score: 0.5, engagement: 0.5, raw: null };
    }
  }

  private async classifyIntroduction(text: string) {
    try {
      // Classify the type and quality of introduction
      const classificationPrompts = [
        {
          inputs: `Classify this self-introduction as "Excellent", "Good", "Average", or "Poor": "${text.substring(0, 500)}"`
        }
      ];

      const response = await fetch(`${this.HF_API_URL}/microsoft/DialoGPT-medium`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classificationPrompts[0])
      });

      const result = await response.json();
      const classification = this.processClassificationResult(result);

      return { classification, score: classification.score, raw: result };
    } catch (error) {
      console.error('Classification failed:', error);
      return { classification: 'Average', score: 0.5, raw: null };
    }
  }

  private async analyzeClarity(text: string) {
    try {
      // Use a model that can assess text clarity
      const response = await fetch(`${this.HF_API_URL}/facebook/bart-large-cnn`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            max_length: 150,
            min_length: 30,
            do_sample: false
          }
        })
      });

      const result = await response.json();
      const clarityScore = this.calculateClarityScore(text, result);

      return { score: clarityScore, summary: result, raw: result };
    } catch (error) {
      console.error('Clarity analysis failed:', error);
      return { score: 0.5, summary: null, raw: null };
    }
  }

  private async analyzeProfessionalism(text: string) {
    try {
      // Use a language model to assess professionalism
      const professionalismPrompt = {
        inputs: `Rate the professionalism of this introduction from 0-10: "${text.substring(0, 300)}". Consider language, tone, and appropriateness.`
      };

      const response = await fetch(`${this.HF_API_URL}/microsoft/DialoGPT-medium`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(professionalismPrompt)
      });

      const result = await response.json();
      const professionalismScore = this.extractProfessionalismScore(result);

      return { score: professionalismScore, raw: result };
    } catch (error) {
      console.error('Professionalism analysis failed:', error);
      return { score: 0.5, raw: null };
    }
  }

  private processSentimentResult(result: any): number {
    try {
      if (!result || !Array.isArray(result) || result.length === 0) return 0.5;

      const scores = result[0];
      if (!scores) return 0.5;

      // Find positive score and normalize
      let positiveScore = 0;
      scores.forEach((item: any) => {
        if (item.label && item.label.toLowerCase().includes('pos')) {
          positiveScore = item.score;
        }
      });

      return positiveScore || 0.5;
    } catch (error) {
      return 0.5;
    }
  }

  private processClassificationResult(result: any): { classification: string; score: number } {
    try {
      if (!result || !result[0]?.generated_text) {
        return { classification: 'Average', score: 0.5 };
      }

      const generatedText = result[0].generated_text.toLowerCase();

      if (generatedText.includes('excellent')) return { classification: 'Excellent', score: 0.9 };
      if (generatedText.includes('good')) return { classification: 'Good', score: 0.75 };
      if (generatedText.includes('poor')) return { classification: 'Poor', score: 0.25 };

      return { classification: 'Average', score: 0.5 };
    } catch (error) {
      return { classification: 'Average', score: 0.5 };
    }
  }

  private calculateClarityScore(originalText: string, summaryResult: any): number {
    try {
      if (!summaryResult || !summaryResult[0]?.summary_text) {
        return this.basicClarityScore(originalText);
      }

      // Compare original with summary to assess clarity
      const summary = summaryResult[0].summary_text;
      const compressionRatio = summary.length / originalText.length;

      // Good clarity if summary captures essence with reasonable compression
      if (compressionRatio >= 0.3 && compressionRatio <= 0.7) {
        return 0.8;
      } else if (compressionRatio >= 0.2 && compressionRatio <= 0.8) {
        return 0.6;
      } else {
        return this.basicClarityScore(originalText);
      }
    } catch (error) {
      return this.basicClarityScore(originalText);
    }
  }

  private basicClarityScore(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = text.length / sentences.length;

    // Score based on sentence structure
    if (avgSentenceLength >= 10 && avgSentenceLength <= 25) return 0.7;
    if (avgSentenceLength >= 8 && avgSentenceLength <= 30) return 0.6;
    return 0.4;
  }

  private extractProfessionalismScore(result: any): number {
    try {
      if (!result || !result[0]?.generated_text) return 0.5;

      const generatedText = result[0].generated_text;
      const numberMatch = generatedText.match(/\b([0-9]|10)\b/);

      if (numberMatch) {
        const score = parseInt(numberMatch[1]);
        return Math.min(10, Math.max(0, score)) / 10;
      }

      return 0.5;
    } catch (error) {
      return 0.5;
    }
  }

  private calculateCompleteness(text: string): number {
    const lowerText = text.toLowerCase();
    let score = 0;
    const checks = [
      { pattern: /\b(name|i am|i'm)\b/, weight: 0.2 }, // Name mentioned
      { pattern: /\b(age|years? old)\b/, weight: 0.15 }, // Age mentioned
      { pattern: /\b(school|class|grade|study|student)\b/, weight: 0.15 }, // Education
      { pattern: /\b(family|mother|father|parent|brother|sister)\b/, weight: 0.15 }, // Family
      { pattern: /\b(hobby|interest|like|enjoy|play)\b/, weight: 0.15 }, // Hobbies
      { pattern: /\b(goal|dream|future|want|become|aspire)\b/, weight: 0.1 }, // Goals
      { pattern: /\b(thank|appreciate|pleasure)\b/, weight: 0.1 } // Gratitude
    ];

    checks.forEach(check => {
      if (check.pattern.test(lowerText)) {
        score += check.weight;
      }
    });

    return Math.min(1, score);
  }

  private calculateEngagement(text: string): number {
    const engagingWords = [
      'excited', 'passionate', 'love', 'enjoy', 'proud', 'happy',
      'grateful', 'enthusiastic', 'thrilled', 'delighted', 'interested'
    ];

    const lowerText = text.toLowerCase();
    const engagingCount = engagingWords.filter(word => lowerText.includes(word)).length;
    const words = text.split(/\s+/).length;

    return Math.min(1, engagingCount / 3); // Normalize based on engaging words
  }

  private analyzeStructure(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let score = 0.3; // Base score

    // Check for proper opening
    if (sentences.length > 0) {
      const firstSentence = sentences[0].toLowerCase();
      if (firstSentence.includes('hello') || firstSentence.includes('hi') ||
          firstSentence.includes('good morning') || firstSentence.includes('good afternoon')) {
        score += 0.2;
      }
    }

    // Check for proper closing
    if (sentences.length > 1) {
      const lastSentence = sentences[sentences - 1].toLowerCase();
      if (lastSentence.includes('thank') || lastSentence.includes('appreciate') ||
          lastSentence.includes('pleasure')) {
        score += 0.2;
      }
    }

    // Check for logical flow (length considerations)
    if (sentences.length >= 3 && sentences.length <= 8) {
      score += 0.3; // Good length for self-introduction
    }

    return Math.min(1, score);
  }

  private calculateOverallScore(analysis: any): number {
    const weights = {
      clarity: 0.25,
      completeness: 0.30,
      professionalism: 0.20,
      engagement: 0.15,
      structure: 0.10
    };

    return Math.round(
      analysis.clarity * weights.clarity * 100 +
      analysis.completeness * weights.completeness * 100 +
      analysis.professionalism * weights.professionalism * 100 +
      analysis.engagement * weights.engagement * 100 +
      analysis.structure * weights.structure * 100
    );
  }

  private generateFeedback(score: number, analysis: any, transcript: string): {
    grade: string;
    feedback: string[];
    strengths: string[];
    improvements: string[];
  } {
    const grade = this.getGrade(score);
    const feedback: string[] = [];
    const strengths: string[] = [];
    const improvements: string[] = [];

    // Generate feedback based on analysis
    if (analysis.clarity >= 0.8) {
      strengths.push("Clear and well-structured communication");
    } else {
      improvements.push("Work on making your introduction clearer and more organized");
    }

    if (analysis.completeness >= 0.8) {
      strengths.push("Comprehensive introduction covering all key aspects");
    } else {
      improvements.push("Include more essential information about yourself");
    }

    if (analysis.professionalism >= 0.8) {
      strengths.push("Professional tone and appropriate language");
    } else {
      improvements.push("Use more professional language and tone");
    }

    if (analysis.engagement >= 0.7) {
      strengths.push("Engaging and positive presentation");
    } else {
      improvements.push("Add more enthusiasm and engaging language");
    }

    if (analysis.structure >= 0.8) {
      strengths.push("Well-structured introduction with proper opening and closing");
    } else {
      improvements.push("Improve the structure with better opening and closing");
    }

    // General feedback
    feedback.push(`Your introduction scored ${score}/100 (${grade})`);

    if (score >= 85) {
      feedback.push("Excellent self-introduction! Very well done.");
    } else if (score >= 70) {
      feedback.push("Good introduction with room for improvement.");
    } else if (score >= 55) {
      feedback.push("Fair introduction that needs some enhancement.");
    } else {
      feedback.push("Introduction needs significant improvement.");
    }

    return { grade, feedback, strengths, improvements };
  }

  private getGrade(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    if (score >= 35) return 'D-';
    return 'F';
  }

  private calculateConfidence(results: any[]): number {
    const validResults = results.filter(r => r.raw !== null);
    return validResults.length / results.length;
  }

  private fallbackScoring(transcript: string): HFScoringResult {
    // Basic scoring when Hugging Face APIs fail
    const wordCount = transcript.split(/\s+/).length;
    const analysis = {
      clarity: Math.min(1, wordCount / 100),
      completeness: this.calculateCompleteness(transcript),
      professionalism: 0.5,
      engagement: this.calculateEngagement(transcript),
      structure: this.analyzeStructure(transcript)
    };

    const score = this.calculateOverallScore(analysis);
    const { grade, feedback, strengths, improvements } = this.generateFeedback(score, analysis, transcript);

    return {
      score,
      maxScore: 100,
      grade,
      feedback,
      strengths,
      improvements,
      confidence: 0.3, // Low confidence for fallback
      analysis
    };
  }
}

export default HuggingFaceScoringEngine;