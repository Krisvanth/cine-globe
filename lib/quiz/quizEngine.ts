import {
  QuizQuestionPublic,
  QuizQuestionServer,
  QuizSessionState,
  QuizAnswerResult,
} from '@/types/quiz';
import {
  QUIZ_QUESTIONS,
  getQuizQuestionById,
  getRandomQuizQuestion,
} from '@/data/quizQuestions';

// Convert server question to public format (stripping correctOptionIndex and explanation)
export function sanitizeQuestionForClient(q: QuizQuestionServer): QuizQuestionPublic {
  return {
    id: q.id,
    question: q.question,
    options: q.options,
    category: q.category,
    difficulty: q.difficulty,
  };
}

// Active session storage with TTL
interface StoredSession extends QuizSessionState {
  answeredQuestionsMap: Record<string, { selectedOption: number; isCorrect: boolean }>;
  expiresAt: number;
}

const activeSessions = new Map<string, StoredSession>();

// Cleanup expired sessions every 10 minutes
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [id, session] of activeSessions.entries()) {
    if (session.expiresAt < now) {
      activeSessions.delete(id);
    }
  }
}

/**
 * Start a new quiz session server-side
 */
export function startQuizSession(userId?: string): {
  session: QuizSessionState;
  firstQuestion: QuizQuestionPublic;
} {
  cleanupExpiredSessions();

  const sessionId = 'cgq_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  const firstServerQ = getRandomQuizQuestion([])!;
  const firstPublicQ = sanitizeQuestionForClient(firstServerQ);

  const sessionState: StoredSession = {
    sessionId,
    userId,
    livesRemaining: 3,
    score: 0,
    correctAnswersCount: 0,
    currentStreak: 0,
    longestStreak: 0,
    isGameOver: false,
    currentQuestion: firstPublicQ,
    answeredQuestionIds: [],
    answeredQuestionsMap: {},
    startedAt: new Date().toISOString(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  activeSessions.set(sessionId, sessionState);

  return {
    session: {
      sessionId: sessionState.sessionId,
      userId: sessionState.userId,
      livesRemaining: sessionState.livesRemaining,
      score: sessionState.score,
      correctAnswersCount: sessionState.correctAnswersCount,
      currentStreak: sessionState.currentStreak,
      longestStreak: sessionState.longestStreak,
      isGameOver: false,
      currentQuestion: firstPublicQ,
      answeredQuestionIds: [],
      startedAt: sessionState.startedAt,
    },
    firstQuestion: firstPublicQ,
  };
}

/**
 * Validate submitted answer server-side and compute new state
 */
export function submitQuizAnswer(
  sessionId: string,
  questionId: string,
  selectedOptionIndex: number
): QuizAnswerResult {
  const session = activeSessions.get(sessionId);
  if (!session) {
    throw new Error('Invalid or expired quiz session');
  }

  if (session.isGameOver) {
    throw new Error('Quiz session has already ended');
  }

  // Prevent duplicate submissions for the same question
  if (session.answeredQuestionsMap[questionId]) {
    throw new Error('Question has already been answered');
  }

  const question = getQuizQuestionById(questionId);
  if (!question) {
    throw new Error('Question not found');
  }

  const isCorrect = selectedOptionIndex === question.correctOptionIndex;
  let pointsEarned = 0;
  let streakBonus = 0;

  if (isCorrect) {
    pointsEarned = 100;
    session.correctAnswersCount += 1;
    session.currentStreak += 1;
    if (session.currentStreak > session.longestStreak) {
      session.longestStreak = session.currentStreak;
    }

    // Every 5 consecutive correct answers earns a 25-point streak bonus
    if (session.currentStreak % 5 === 0) {
      streakBonus = 25;
      pointsEarned += streakBonus;
    }

    session.score += pointsEarned;
  } else {
    session.livesRemaining = Math.max(0, session.livesRemaining - 1);
    session.currentStreak = 0;
    if (session.livesRemaining === 0) {
      session.isGameOver = true;
      session.completedAt = new Date().toISOString();
    }
  }

  // Record answered state
  session.answeredQuestionIds.push(questionId);
  session.answeredQuestionsMap[questionId] = {
    selectedOption: selectedOptionIndex,
    isCorrect,
  };

  // Select next question if game not over
  let nextQuestion: QuizQuestionPublic | undefined = undefined;
  if (!session.isGameOver) {
    const nextServerQ = getRandomQuizQuestion(session.answeredQuestionIds);
    if (nextServerQ) {
      nextQuestion = sanitizeQuestionForClient(nextServerQ);
      session.currentQuestion = nextQuestion;
    } else {
      // Reached end of all questions!
      session.isGameOver = true;
      session.completedAt = new Date().toISOString();
    }
  } else {
    session.currentQuestion = undefined;
  }

  return {
    isCorrect,
    correctOptionIndex: question.correctOptionIndex,
    explanation: question.explanation,
    pointsEarned,
    streakBonus,
    livesRemaining: session.livesRemaining,
    newScore: session.score,
    currentStreak: session.currentStreak,
    longestStreak: session.longestStreak,
    isGameOver: session.isGameOver,
    nextQuestion,
  };
}

/**
 * Get active session state
 */
export function getQuizSession(sessionId: string): QuizSessionState | undefined {
  return activeSessions.get(sessionId);
}
