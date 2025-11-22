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

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getProgressColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-gradient-to-r from-emerald-400 to-emerald-600';
    if (percentage >= 60) return 'bg-gradient-to-r from-blue-400 to-blue-600';
    if (percentage >= 40) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    return 'bg-gradient-to-r from-red-400 to-red-600';
  };

  const formatSpeechRate = (wpm: number) => {
    if (wpm === 0) return 'Not calculated';
    if (wpm < 100) return `${wpm} WPM (Slow)`;
    if (wpm > 160) return `${wpm} WPM (Fast)`;
    return `${wpm} WPM (Ideal)`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Communication Skills Analysis
              </h1>
              <p className="text-gray-600 mt-1">
                AI-powered rubric evaluation for student self-introductions
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">AI-Powered</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Transcript Input
                </h2>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 mb-2">
                    Student Self-Introduction
                  </label>
                  <textarea
                    id="transcript"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Paste or type the student's self-introduction transcript here...

Example: 'Hello everyone, my name is Sarah. I am 15 years old and I'm studying in Grade 10 at Lincoln High School. I enjoy playing basketball and reading science fiction. Thank you for listening.'"
                    className="w-full h-64 p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 resize-none text-gray-700 placeholder-gray-400"
                    disabled={isScoring}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-600 mb-1">Word Count</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {transcript.trim().split(/\s+/).filter(word => word.length > 0).length}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-600 mb-1">
                      Speech Duration (seconds)
                    </label>
                    <input
                      id="duration"
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g., 52"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                      disabled={isScoring}
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                <button
                  onClick={handleScoreTranscript}
                  disabled={isScoring || !transcript.trim()}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  {isScoring ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing Transcript...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Score Transcript
                    </span>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">Error</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            {result && (
              <>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white">Overall Score</h3>
                  </div>
                  <div className="p-6">
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${getScoreGrade(result.overallScore).color} mb-2`}>
                        {result.overallScore}
                      </div>
                      <div className="text-gray-500 text-lg mb-4">out of {result.maxOverallScore}</div>
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getScoreGrade(result.overallScore).bg} ${getScoreGrade(result.overallScore).color}`}>
                        Grade {getScoreGrade(result.overallScore).grade}
                      </div>
                    </div>
                    <div className="mt-6 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(result.overallScore, result.maxOverallScore)}`}
                        style={{ width: `${(result.overallScore / result.maxOverallScore) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white">Quick Stats</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Word Count</span>
                      <span className="font-semibold text-gray-900">{result.wordCount}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Duration</span>
                      <span className="font-semibold text-gray-900">{result.duration}s</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600 text-sm">Speech Rate</span>
                      <span className="font-semibold text-gray-900">{formatSpeechRate(result.speechRate)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Quick Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="w-4 h-4 mr-2 text-indigo-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Include greeting, name, age, and school
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 mr-2 text-indigo-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Mention hobbies and interests
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 mr-2 text-indigo-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Keep speech rate between 111-140 WPM
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 mr-2 text-indigo-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Avoid filler words (um, uh, like)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        {result && (
          <div className="mt-8 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Detailed Rubric Analysis
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {result.criteria.map((criterion, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {criterion.name}
                          </h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span>Weight: {(criterion.weight * 100).toFixed(0)}%</span>
                            <span>•</span>
                            <span>{criterion.score}/{criterion.maxScore}</span>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreGrade((criterion.score / criterion.maxScore) * 100).bg} ${getScoreGrade((criterion.score / criterion.maxScore) * 100).color}`}>
                          {Math.round((criterion.score / criterion.maxScore) * 100)}%
                        </div>
                      </div>

                      <div className="space-y-3">
                        {criterion.metrics.map((metric, metricIndex) => (
                          <div key={metricIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-semibold text-gray-800">
                                {metric.name}
                              </h4>
                              <div className={`text-sm font-bold ${getScoreGrade((metric.score / metric.maxScore) * 100).color}`}>
                                {metric.score}/{metric.maxScore}
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 mb-3 leading-relaxed">
                              {metric.details}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(metric.score, metric.maxScore)}`}
                                style={{ width: `${(metric.score / metric.maxScore) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(criterion.score, criterion.maxScore)}`}
                            style={{ width: `${(criterion.score / criterion.maxScore) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}