import { NextRequest, NextResponse } from 'next/server';
import { quizFinishSchema } from '@/lib/validation/schemas';
import { getQuizSession } from '@/lib/quiz/quizEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = quizFinishSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid session payload' },
        { status: 400 }
      );
    }

    const { sessionId } = parseResult.data;
    const session = getQuizSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        score: session.score,
        correctAnswersCount: session.correctAnswersCount,
        longestStreak: session.longestStreak,
        isGameOver: session.isGameOver,
        completedAt: session.completedAt || new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[API /api/quiz/finish] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to finalize quiz session' },
      { status: 500 }
    );
  }
}
