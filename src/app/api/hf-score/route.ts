import { NextRequest, NextResponse } from 'next/server';
import HuggingFaceScoringEngine from '@/utils/huggingFaceScoring';
import { AdvancedScoringEngine } from '@/utils/advancedScoringEngine';
import { ScoringEngine } from '@/utils/scoringEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, duration, useAdvanced = true, useHuggingFace = true } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    let result;

    // Priority order: Hugging Face -> Advanced NLP -> Basic Scoring
    if (useHuggingFace) {
      try {
        console.log('Using Hugging Face scoring engine...');
        const hfEngine = new HuggingFaceScoringEngine();
        const hfResult = await hfEngine.scoreIntroduction(transcript, duration);

        // Transform HF result to match expected API format
        result = {
          overallScore: hfResult.score,
          maxOverallScore: hfResult.maxScore,
          grade: hfResult.grade,
          feedback: hfResult.feedback,
          strengths: hfResult.strengths,
          improvements: hfResult.improvements,
          confidence: hfResult.confidence,
          analysis: hfResult.analysis,
          scoringMethod: 'Hugging Face AI',
          detailedBreakdown: {
            'Content Quality': {
              score: hfResult.analysis.completeness * 40,
              maxScore: 40,
              details: `${Math.round(hfResult.analysis.completeness * 100)}% completeness detected`
            },
            'Professionalism': {
              score: hfResult.analysis.professionalism * 20,
              maxScore: 20,
              details: `${Math.round(hfResult.analysis.professionalism * 100)}% professional tone`
            },
            'Clarity': {
              score: hfResult.analysis.clarity * 15,
              maxScore: 15,
              details: `${Math.round(hfResult.analysis.clarity * 100)}% clarity score`
            },
            'Engagement': {
              score: hfResult.analysis.engagement * 15,
              maxScore: 15,
              details: `${Math.round(hfResult.analysis.engagement * 100)}% engagement level`
            },
            'Structure': {
              score: hfResult.analysis.structure * 10,
              maxScore: 10,
              details: `${Math.round(hfResult.analysis.structure * 100)}% structure score`
            }
          }
        };

        console.log(`Hugging Face scoring successful: ${hfResult.score}/100 (${hfResult.grade})`);

      } catch (hfError) {
        console.error('Hugging Face scoring failed, falling back to advanced:', hfError);
        // Fallback to advanced scoring
        useAdvanced = true;
        useHuggingFace = false;
      }
    }

    if (!result && useAdvanced) {
      try {
        console.log('Using advanced NLP scoring engine...');
        const advancedEngine = new AdvancedScoringEngine();
        const advancedResult = await advancedEngine.scoreTranscriptAdvanced(transcript, duration);

        // Transform advanced result to match expected API format
        result = {
          overallScore: advancedResult.overallScore,
          maxOverallScore: advancedResult.maxOverallScore,
          grade: getGradeFromScore(advancedResult.overallScore),
          feedback: advancedResult.advancedInsights.tieredRecommendations.advancedNLP,
          strengths: extractStrengths(advancedResult.criteria),
          improvements: advancedResult.advancedInsights.ruleBasedFeedback,
          confidence: 0.8,
          analysis: {
            clarity: extractClarityScore(advancedResult.criteria),
            completeness: extractCompletenessScore(advancedResult.criteria),
            professionalism: extractProfessionalismScore(advancedResult.criteria),
            engagement: extractEngagementScore(advancedResult.criteria),
            structure: extractStructureScore(advancedResult.criteria)
          },
          scoringMethod: 'Advanced NLP',
          detailedBreakdown: transformCriteriaToBreakdown(advancedResult.criteria),
          advancedInsights: advancedResult.advancedInsights,
          concisenessAnalysis: advancedResult.concisenessAnalysis
        };

        console.log(`Advanced NLP scoring successful: ${advancedResult.overallScore}/100`);

      } catch (advancedError) {
        console.error('Advanced scoring failed, falling back to basic:', advancedError);
        useAdvanced = false;
      }
    }

    if (!result) {
      try {
        console.log('Using basic scoring engine...');
        const basicEngine = new ScoringEngine();
        const basicResult = basicEngine.scoreTranscript(transcript, duration);

        // Transform basic result to match expected API format
        result = {
          overallScore: basicResult.overallScore,
          maxOverallScore: basicResult.maxOverallScore,
          grade: getGradeFromScore(basicResult.overallScore),
          feedback: basicResult.criteria.filter(c => c.score < c.maxScore * 0.7).map(c => `${c.name} needs improvement`),
          strengths: basicResult.criteria.filter(c => c.score >= c.maxScore * 0.8).map(c => `${c.name} is strong`),
          improvements: basicResult.criteria.filter(c => c.score < c.maxScore * 0.7).map(c => `Improve ${c.name.toLowerCase()}`),
          confidence: 0.6,
          analysis: {
            clarity: 0.6,
            completeness: 0.6,
            professionalism: 0.6,
            engagement: 0.6,
            structure: 0.6
          },
          scoringMethod: 'Basic Rubric',
          detailedBreakdown: transformCriteriaToBreakdown(basicResult.criteria)
        };

        console.log(`Basic scoring successful: ${basicResult.overallScore}/100`);

      } catch (basicError) {
        console.error('All scoring methods failed:', basicError);
        return NextResponse.json(
          { error: 'All scoring methods failed', details: basicError },
          { status: 500 }
        );
      }
    }

    // Add metadata
    result.metadata = {
      wordCount: transcript.split(/\s+/).length,
      duration: duration || 0,
      timestamp: new Date().toISOString(),
      scoringEngine: result.scoringMethod
    };

    console.log(`Final result: ${result.overallScore}/100 (${result.grade}) using ${result.scoringMethod}`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions
function getGradeFromScore(score: number): string {
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

function extractStrengths(criteria: any[]): string[] {
  const strengths: string[] = [];
  criteria.forEach(criterion => {
    criterion.metrics?.forEach((metric: any) => {
      if (metric.nlpInsights?.detectedStrengths) {
        strengths.push(...metric.nlpInsights.detectedStrengths);
      }
    });
  });
  return strengths.slice(0, 5); // Limit to top 5
}

function extractClarityScore(criteria: any[]): number {
  const clarityCriterion = criteria.find(c => c.name === 'Clarity');
  if (!clarityCriterion) return 0.6;
  return clarityCriterion.score / clarityCriterion.maxScore;
}

function extractCompletenessScore(criteria: any[]): number {
  const contentCriterion = criteria.find(c => c.name === 'Content & Structure');
  if (!contentCriterion) return 0.6;
  return contentCriterion.score / contentCriterion.maxScore;
}

function extractProfessionalismScore(criteria: any[]): number {
  const toneCriterion = criteria.find(c => c.name === 'Tone & Register');
  if (!toneCriterion) return 0.6;
  return toneCriterion.score / toneCriterion.maxScore;
}

function extractEngagementScore(criteria: any[]): number {
  const engagementCriterion = criteria.find(c => c.name === 'Engagement');
  if (!engagementCriterion) return 0.6;
  return engagementCriterion.score / engagementCriterion.maxScore;
}

function extractStructureScore(criteria: any[]): number {
  const contentCriterion = criteria.find(c => c.name === 'Content & Structure');
  if (!contentCriterion) return 0.6;
  // Look for flow and coherence metrics
  const flowMetric = contentCriterion.metrics?.find((m: any) => m.name.includes('Flow'));
  if (flowMetric) {
    return flowMetric.score / flowMetric.maxScore;
  }
  return 0.6;
}

function transformCriteriaToBreakdown(criteria: any[]): any {
  const breakdown: any = {};
  criteria.forEach(criterion => {
    breakdown[criterion.name] = {
      score: criterion.score,
      maxScore: criterion.maxScore,
      details: `${criterion.score}/${criterion.maxScore} points`
    };
  });
  return breakdown;
}