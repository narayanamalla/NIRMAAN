import { NextRequest, NextResponse } from 'next/server';
import { AdvancedScoringEngine } from '@/utils/advancedScoringEngine';
import { ScoringEngine } from '@/utils/scoringEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, duration, useAdvanced = true } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    // Use advanced scoring by default, with fallback to basic scoring
    let result;
    try {
      const advancedEngine = new AdvancedScoringEngine();
      result = await advancedEngine.scoreTranscriptAdvanced(transcript, duration || 0);
    } catch (advancedError) {
      console.warn('Advanced scoring failed, falling back to basic scoring:', advancedError);
      const basicEngine = new ScoringEngine();
      result = await basicEngine.scoreTranscript(transcript, duration || 0);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Scoring error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error during scoring',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}