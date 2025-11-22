'use client';

import { useState } from 'react';

interface MetricScore {
  name: string;
  score: number;
  maxScore: number;
  details: string;
}

interface CriterionScore {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  metrics: MetricScore[];
}

interface ScoreResult {
  overallScore: number;
  maxOverallScore: number;
  wordCount: number;
  duration: number;
  speechRate: number;
  criteria: CriterionScore[];
}

export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [duration, setDuration] = useState('');
  const [isScoring, setIsScoring] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScoreTranscript = async () => {
    if (!transcript.trim()) {
      setError('Please enter a transcript to score.');
      return;
    }

    setIsScoring(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          duration: duration ? parseFloat(duration) : 0
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Scoring failed');
      }

      const scoreResult = await response.json();
      setResult(scoreResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsScoring(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Communication Skills Analysis Tool
          </h1>
          <p className="text-lg text-gray-600">
            Analyze and score student self-introduction transcripts using AI-powered rubric evaluation
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Enter Transcript Text
          </h2>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste or type the student's self-introduction transcript here..."
            className="w-full h-40 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isScoring}
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {transcript.trim().split(/\s+/).filter(word => word.length > 0).length} words
            </div>
            <button
              onClick={handleScoreTranscript}
              disabled={isScoring || !transcript.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isScoring ? 'Scoring...' : 'Score Transcript'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-8">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Overall Results
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Overall Score</div>
                  <div className={`text-4xl font-bold ${getScoreColor(result.overallScore)}`}>
                    {result.overallScore}/100
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Word Count</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {result.wordCount}
                  </div>
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${getScoreBackground(result.overallScore)}`}
                  style={{ width: `${result.overallScore}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Detailed Breakdown
              </h2>
              <div className="space-y-6">
                {result.criteria.map((criterion, index) => (
                  <div key={index} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {criterion.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Weight: {(criterion.weight * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(criterion.score)}`}>
                          {criterion.score}/100
                        </div>
                        <div className="text-sm text-gray-500">
                          Semantic: {criterion.semanticSimilarity.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Keywords Found</div>
                        <div className="flex flex-wrap gap-1">
                          {criterion.keywordsFound.length > 0 ? (
                            criterion.keywordsFound.map((keyword, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                              >
                                {keyword}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">No keywords found</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Feedback</div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {criterion.feedback}
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${getScoreBackground(criterion.score)}`}
                          style={{ width: `${criterion.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
