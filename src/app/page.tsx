'use client';

import { useState, useEffect } from 'react';

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
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (isScoring) {
      const interval = setInterval(() => {
        setAnalyzingStep((prev) => (prev + 1) % 4);
      }, 800);
      return () => clearInterval(interval);
    } else {
      setAnalyzingStep(0);
    }
  }, [isScoring]);

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
    if (score >= 90) return { grade: 'A', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-400' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-400' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-400' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-400' };
    return { grade: 'F', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-400' };
  };

  const getProgressColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600';
    if (percentage >= 60) return 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600';
    if (percentage >= 40) return 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600';
    return 'bg-gradient-to-r from-red-400 via-red-500 to-red-600';
  };

  const formatSpeechRate = (wpm: number) => {
    if (wpm === 0) return 'Not calculated';
    if (wpm < 100) return `${wpm} WPM (Slow)`;
    if (wpm > 160) return `${wpm} WPM (Fast)`;
    return `${wpm} WPM (Ideal)`;
  };

  const analyzingSteps = ['Analyzing content...', 'Checking keywords...', 'Calculating scores...', 'Generating results...'];

  if (!mounted) return null;

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900"></div>

        {/* Floating Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] dark:opacity-10"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Communication Skills Analysis
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  AI-powered rubric evaluation for student self-introductions
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  AI-Powered
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {darkMode ? (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white flex items-center">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      Transcript Input
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Student Self-Introduction
                      </label>
                      <div className="relative">
                        <textarea
                          id="transcript"
                          value={transcript}
                          onChange={(e) => setTranscript(e.target.value)}
                          placeholder="Paste or type the student's self-introduction transcript here...

Example: 'Hello everyone, my name is Sarah. I am 15 years old and I'm studying in Grade 10 at Lincoln High School. I enjoy playing basketball and reading science fiction. Thank you for listening.'"
                          className="w-full h-64 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 resize-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-gray-50 dark:bg-gray-900/50 backdrop-blur"
                          disabled={isScoring}
                        />
                        <div className="absolute bottom-4 right-4 text-sm text-gray-500 dark:text-gray-400">
                          {transcript.trim().split(/\s+/).filter(word => word.length > 0).length} words
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Word Count</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              {transcript.trim().split(/\s+/).filter(word => word.length > 0).length}
                            </div>
                          </div>
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Speech Duration
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            id="duration"
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="52"
                            className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            disabled={isScoring}
                            min="0"
                            step="0.1"
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400">seconds</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleScoreTranscript}
                      disabled={isScoring || !transcript.trim()}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {isScoring ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {analyzingSteps[analyzingStep]}
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Score Transcript
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-lg backdrop-blur-sm animate-bounce">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 dark:text-red-300 font-medium">Error</p>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              {result && (
                <>
                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          Overall Score
                        </h3>
                      </div>
                      <div className="p-6">
                        <div className="text-center">
                          <div className={`text-5xl font-bold ${getScoreGrade(result.overallScore).color} mb-2`}>
                            {result.overallScore}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">out of {result.maxOverallScore}</div>
                          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${getScoreGrade(result.overallScore).bg} ${getScoreGrade(result.overallScore).color} border ${getScoreGrade(result.overallScore).border}`}>
                            Grade {getScoreGrade(result.overallScore).grade}
                          </div>
                        </div>
                        <div className="mt-6 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1500 ease-out ${getProgressColor(result.overallScore, result.maxOverallScore)}`}
                            style={{ width: `${(result.overallScore / result.maxOverallScore) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          Quick Stats
                        </h3>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">Word Count</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{result.wordCount}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">Duration</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{result.duration}s</span>
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">Speech Rate</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{formatSpeechRate(result.speechRate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-200/50 dark:border-purple-700/50 p-6">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Quick Tips
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    {[
                      { icon: "👋", tip: "Start with a friendly greeting" },
                      { icon: "📝", tip: "Include name, age, and school" },
                      { icon: "🎯", tip: "Mention hobbies and interests" },
                      { icon: "⚡", tip: "Keep speech rate at 111-140 WPM" },
                      { icon: "🚫", tip: "Avoid filler words (um, uh, like)" }
                    ].map((item, index) => (
                      <li key={index} className="flex items-start group hover:text-gray-900 dark:hover:text-white transition-colors">
                        <span className="text-lg mr-3 group-hover:scale-110 transition-transform">{item.icon}</span>
                        <span className="pt-0.5">{item.tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          {result && (
            <div className="mt-8 space-y-6">
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      Detailed Rubric Analysis
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {result.criteria.map((criterion, index) => (
                        <div key={index} className="group/criterion bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover/criterion:text-blue-600 dark:group-hover/criterion:text-blue-400 transition-colors">
                                {criterion.name}
                              </h3>
                              <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                                <span>Weight: {(criterion.weight * 100).toFixed(0)}%</span>
                                <span>•</span>
                                <span>{criterion.score}/{criterion.maxScore}</span>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreGrade((criterion.score / criterion.maxScore) * 100).bg} ${getScoreGrade((criterion.score / criterion.maxScore) * 100).color} border ${getScoreGrade((criterion.score / criterion.maxScore) * 100).border} animate-pulse-once`}>
                              {Math.round((criterion.score / criterion.maxScore) * 100)}%
                            </div>
                          </div>

                          <div className="space-y-3">
                            {criterion.metrics.map((metric, metricIndex) => (
                              <div key={metricIndex} className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                    {metric.name}
                                  </h4>
                                  <div className={`text-sm font-bold ${getScoreGrade((metric.score / metric.maxScore) * 100).color}`}>
                                    {metric.score}/{metric.maxScore}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                                  {metric.details}
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(metric.score, metric.maxScore)}`}
                                    style={{ width: `${(metric.score / metric.maxScore) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1500 ease-out ${getProgressColor(criterion.score, criterion.maxScore)}`}
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
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-once {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-once {
          animation: pulse-once 2s ease-in-out;
        }
      `}</style>
    </div>
  );
}