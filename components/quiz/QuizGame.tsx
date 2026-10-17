'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Heart,
  Flame,
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { QuizQuestionPublic, QuizAnswerResult } from '@/types/quiz';
import { recordGuestQuizGame } from '@/lib/guest/guestStorage';

export const QuizGame: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestionPublic | null>(null);
  const [lives, setLives] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalAnswered, setTotalAnswered] = useState<number>(0);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [answerResult, setAnswerResult] = useState<QuizAnswerResult | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize a new game
  const startNewGame = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSelectedOption(null);
    setAnswerResult(null);
    setIsGameOver(false);
    setLives(3);
    setScore(0);
    setStreak(0);
    setLongestStreak(0);
    setCorrectCount(0);
    setTotalAnswered(0);

    try {
      const res = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error('Failed to start quiz session');
      const data = await res.json();

      setSessionId(data.session.sessionId);
      setCurrentQuestion(data.firstQuestion);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to start quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const handleSelectOption = async (optionIndex: number) => {
    if (selectedOption !== null || isSubmitting || !sessionId || !currentQuestion || isGameOver) {
      return;
    }

    setSelectedOption(optionIndex);
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          selectedOptionIndex: optionIndex,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Answer submission failed');
      }

      const result: QuizAnswerResult = await res.json();
      setAnswerResult(result);
      setScore(result.newScore);
      setLives(result.livesRemaining);
      setStreak(result.currentStreak);
      setLongestStreak(result.longestStreak);
      setTotalAnswered((prev) => prev + 1);

      if (result.isCorrect) {
        setCorrectCount((prev) => prev + 1);
        if (result.streakBonus > 0) {
          confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
        }
      }

      if (result.isGameOver) {
        setIsGameOver(true);
        recordGuestQuizGame(result.newScore, correctCount + (result.isCorrect ? 1 : 0), result.longestStreak);
        if (result.newScore >= 500) {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (!answerResult) return;
    if (answerResult.isGameOver || !answerResult.nextQuestion) {
      setIsGameOver(true);
    } else {
      setCurrentQuestion(answerResult.nextQuestion);
      setSelectedOption(null);
      setAnswerResult(null);
    }
  };

  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top HUD: Lives, Score, Streak */}
      <div className="flex items-center justify-between p-4 rounded-2xl glass-panel-gold border border-[#d4af37]/30 shadow-xl">
        {/* Lives Counter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-zinc-400 mr-1 hidden sm:inline">
            Lives:
          </span>
          {[1, 2, 3].map((num) => (
            <Heart
              key={num}
              className={`w-6 h-6 transition-all duration-300 ${
                num <= lives
                  ? 'fill-red-500 text-red-500 scale-100 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                  : 'fill-zinc-800 text-zinc-700 scale-90 opacity-40'
              }`}
            />
          ))}
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-950/30 border border-orange-500/30 text-orange-400 text-xs font-bold">
          <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-400 fill-orange-400 animate-pulse' : 'text-zinc-600'}`} />
          <span>{streak} Streak</span>
          {streak >= 5 && <span className="text-[10px] text-amber-300">+25 Bonus!</span>}
        </div>

        {/* Score Display */}
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#d4af37]" />
          <div className="flex flex-col items-end">
            <span className="text-xl font-extrabold text-[#e5c07b] font-mono leading-none">
              {score}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-zinc-400">Points</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Main Game Arena / Question Card */}
      {!isGameOver && currentQuestion ? (
        <div className="rounded-3xl glass-panel p-6 sm:p-8 space-y-6 border border-white/10 shadow-2xl relative">
          {/* Question Metadata Category */}
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#e5c07b] capitalize font-medium">
              {currentQuestion.category.replace(/_/g, ' ')}
            </span>
            <span className="text-zinc-500 capitalize">
              Difficulty: <strong className="text-zinc-300">{currentQuestion.difficulty}</strong>
            </span>
          </div>

          {/* Question Text */}
          <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {currentQuestion.question}
          </h3>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              let optionStyle =
                'bg-white/5 border-white/10 text-zinc-200 hover:border-[#d4af37]/50 hover:bg-[#12141d]';

              if (answerResult) {
                if (idx === answerResult.correctOptionIndex) {
                  // Correct option highlight
                  optionStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                } else if (isSelected && !answerResult.isCorrect) {
                  // Wrong selected option
                  optionStyle = 'bg-red-950/60 border-red-500 text-red-200';
                } else {
                  optionStyle = 'bg-white/5 border-white/5 opacity-40 text-zinc-500';
                }
              } else if (isSelected) {
                optionStyle = 'border-[#d4af37] bg-[#d4af37]/20 text-[#e5c07b]';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={selectedOption !== null || isSubmitting}
                  className={`p-4 rounded-2xl border text-left text-sm transition-all duration-200 flex items-center justify-between group active:scale-[0.99] ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/10 border border-white/10 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-medium">{option}</span>
                  </div>

                  {answerResult && idx === answerResult.correctOptionIndex && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {answerResult && isSelected && !answerResult.isCorrect && (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer Explanation & Next Question Button */}
          {answerResult && (
            <div className="pt-4 border-t border-white/10 space-y-4 animate-in fade-in duration-300">
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                answerResult.isCorrect
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                  : 'bg-red-950/30 border-red-500/30 text-red-200'
              }`}>
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  {answerResult.isCorrect ? (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Correct! (+{answerResult.pointsEarned} pts)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span>Incorrect (-1 Life)</span>
                    </>
                  )}
                </div>
                <p className="text-zinc-300">{answerResult.explanation}</p>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full py-3 px-6 rounded-2xl bg-[#d4af37] hover:bg-[#e5c07b] text-black font-extrabold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                <span>{answerResult.isGameOver ? 'View Final Results' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* Game Over Screen */}
      {isGameOver && (
        <div className="rounded-3xl glass-panel-gold p-8 text-center space-y-6 border border-[#d4af37]/40 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37]">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
              Game Over
            </h2>
            <p className="text-xs text-zinc-400">
              {lives === 0 ? 'All 3 lives exhausted.' : 'Masterful knowledge! You reached the end of the round.'}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold block">
                Final Score
              </span>
              <span className="text-xl font-extrabold text-[#e5c07b] font-mono">
                {score}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold block">
                Correct Answers
              </span>
              <span className="text-xl font-extrabold text-white font-mono">
                {correctCount}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold block">
                Accuracy
              </span>
              <span className="text-xl font-extrabold text-white font-mono">
                {accuracy}%
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold block">
                Longest Streak
              </span>
              <span className="text-xl font-extrabold text-orange-400 font-mono">
                {longestStreak} 🔥
              </span>
            </div>
          </div>

          {/* Restart Button */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={startNewGame}
              className="flex-1 py-3 px-6 rounded-2xl bg-[#d4af37] hover:bg-[#e5c07b] text-black font-extrabold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Another Game</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
