import { NextRequest, NextResponse } from 'next/server';
import { quizAnswerSchema } from '@/lib/validation/schemas';
import { submitQuizAnswer } from '@/lib/quiz/quizEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = quizAnswerSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid answer submission',
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { sessionId, questionId, selectedOptionIndex } = parseResult.data;

    const result = submitQuizAnswer(sessionId, questionId, selectedOptionIndex);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('[API /api/quiz/answer] Error:', error);
    const isClientError =
      error.message?.includes('Invalid') ||
      error.message?.includes('already') ||
      error.message?.includes('ended');

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to submit answer',
      },
      { status: isClientError ? 400 : 500 }
    );
  }
}
