import { NextRequest, NextResponse } from 'next/server';
import { quizStartSchema } from '@/lib/validation/schemas';
import { startQuizSession } from '@/lib/quiz/quizEngine';

export async function POST(req: NextRequest) {
  try {
    let userId: string | undefined = undefined;

    try {
      const body = await req.json();
      const parsed = quizStartSchema.safeParse(body);
      if (parsed.success && parsed.data.userId) {
        userId = parsed.data.userId;
      }
    } catch {
      // Body is optional
    }

    const { session, firstQuestion } = startQuizSession(userId);

    return NextResponse.json({
      success: true,
      session,
      firstQuestion,
    });
  } catch (error: any) {
    console.error('[API /api/quiz/start] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start quiz session', message: error?.message },
      { status: 500 }
    );
  }
}
