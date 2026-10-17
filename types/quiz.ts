export type QuizCategory =
  | 'film_identification'
  | 'directors'
  | 'actors'
  | 'production_country'
  | 'release_year'
  | 'film_awards'
  | 'world_cinema_history'
  | 'film_language_genres';

export interface QuizQuestionPublic {
  id: string;
  question: string;
  options: string[];
  category: QuizCategory;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestionServer extends QuizQuestionPublic {
  correctOptionIndex: number; // 0..3
  explanation: string;
  sourceAttribution?: string;
}

export interface QuizSessionState {
  sessionId: string;
  userId?: string;
  livesRemaining: number;
  score: number;
  correctAnswersCount: number;
  currentStreak: number;
  longestStreak: number;
  isGameOver: boolean;
  currentQuestion?: QuizQuestionPublic;
  answeredQuestionIds: string[];
  startedAt: string;
  completedAt?: string;
}

export interface QuizAnswerSubmission {
  sessionId: string;
  questionId: string;
  selectedOptionIndex: number;
}

export interface QuizAnswerResult {
  isCorrect: boolean;
  correctOptionIndex: number;
  explanation: string;
  pointsEarned: number;
  streakBonus: number;
  livesRemaining: number;
  newScore: number;
  currentStreak: number;
  longestStreak: number;
  isGameOver: boolean;
  nextQuestion?: QuizQuestionPublic;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatarUrl?: string;
  score: number;
  correctAnswers: number;
  completedAt: string;
  durationSeconds?: number;
}
