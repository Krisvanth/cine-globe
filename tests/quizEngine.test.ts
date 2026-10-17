import { describe, it, expect } from 'vitest';
import {
  startQuizSession,
  submitQuizAnswer,
  getQuizSession,
  sanitizeQuestionForClient,
} from '@/lib/quiz/quizEngine';
import { getQuizQuestionById } from '@/data/quizQuestions';

describe('Cine Quiz Engine', () => {
  it('starts a session with exactly 3 lives and score 0', () => {
    const { session, firstQuestion } = startQuizSession('test_user');
    expect(session.livesRemaining).toBe(3);
    expect(session.score).toBe(0);
    expect(session.currentStreak).toBe(0);
    expect(session.isGameOver).toBe(false);
    expect(firstQuestion).toBeDefined();
    expect(firstQuestion.options.length).toBe(4);
  });

  it('never leaks correctOptionIndex or explanation in sanitized client questions', () => {
    const serverQ = getQuizQuestionById('q1')!;
    const sanitized: any = sanitizeQuestionForClient(serverQ);
    expect(sanitized.correctOptionIndex).toBeUndefined();
    expect(sanitized.explanation).toBeUndefined();
    expect(sanitized.question).toBe(serverQ.question);
    expect(sanitized.options.length).toBe(4);
  });

  it('awards 100 points and increments streak on correct answer', () => {
    const { session, firstQuestion } = startQuizSession();
    const serverQ = getQuizQuestionById(firstQuestion.id)!;

    const result = submitQuizAnswer(
      session.sessionId,
      firstQuestion.id,
      serverQ.correctOptionIndex
    );

    expect(result.isCorrect).toBe(true);
    expect(result.pointsEarned).toBe(100);
    expect(result.livesRemaining).toBe(3);
    expect(result.newScore).toBe(100);
    expect(result.currentStreak).toBe(1);
    expect(result.isGameOver).toBe(false);
  });

  it('decrements life and resets streak on incorrect answer', () => {
    const { session, firstQuestion } = startQuizSession();
    const serverQ = getQuizQuestionById(firstQuestion.id)!;
    const wrongOption = (serverQ.correctOptionIndex + 1) % 4;

    const result = submitQuizAnswer(session.sessionId, firstQuestion.id, wrongOption);

    expect(result.isCorrect).toBe(false);
    expect(result.pointsEarned).toBe(0);
    expect(result.livesRemaining).toBe(2);
    expect(result.currentStreak).toBe(0);
    expect(result.newScore).toBe(0);
  });

  it('rejects duplicate submissions for the same question', () => {
    const { session, firstQuestion } = startQuizSession();
    const serverQ = getQuizQuestionById(firstQuestion.id)!;

    submitQuizAnswer(session.sessionId, firstQuestion.id, serverQ.correctOptionIndex);

    expect(() => {
      submitQuizAnswer(session.sessionId, firstQuestion.id, serverQ.correctOptionIndex);
    }).toThrow(/already been answered/);
  });

  it('ends game when all 3 lives are lost', () => {
    const { session, firstQuestion } = startQuizSession();
    let currentQ = firstQuestion;

    // Fail 3 times
    for (let i = 0; i < 3; i++) {
      const serverQ = getQuizQuestionById(currentQ.id)!;
      const wrong = (serverQ.correctOptionIndex + 1) % 4;
      const res = submitQuizAnswer(session.sessionId, currentQ.id, wrong);

      if (i < 2) {
        expect(res.isGameOver).toBe(false);
        currentQ = res.nextQuestion!;
      } else {
        expect(res.livesRemaining).toBe(0);
        expect(res.isGameOver).toBe(true);
      }
    }

    const state = getQuizSession(session.sessionId)!;
    expect(state.livesRemaining).toBe(0);
    expect(state.isGameOver).toBe(true);
  });
});
