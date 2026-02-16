import { NextResponse } from 'next/server';
import EvaluationEngine from '@/lib/evaluationEngine';

export async function POST(request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.' }, { status: 500 });
    }

    const body = await request.json();
    const { student_name, artifacts, portfolio_result } = body;

    if (!artifacts || artifacts.length === 0) {
      return NextResponse.json({ error: '산출물이 필요합니다.' }, { status: 400 });
    }

    const engine = new EvaluationEngine(apiKey);
    const result = await engine.generateSchoolRecord(
      student_name || '학생',
      artifacts,
      portfolio_result
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] 생기부 오류:', error.message);
    return NextResponse.json({ error: `생기부 초안 생성 중 오류 발생: ${error.message}` }, { status: 500 });
  }
}
