import { NextRequest, NextResponse } from 'next/server';
import { ScoringEngine } from '@/utils/scoringEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const scoringEngine = new ScoringEngine();
    const result = await scoringEngine.scoreTranscript(transcript);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Scoring error:', error);
    return NextResponse.json(
      { error: 'Internal server error during scoring' },
      { status: 500 }
    );
  }
}