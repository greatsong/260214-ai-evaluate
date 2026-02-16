import { NextResponse } from 'next/server';
import EvaluationEngine from '@/lib/evaluationEngine';

export async function POST(request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.' }, { status: 500 });
    }

    const body = await request.json();
    const { practice_type, artifacts } = body;

    if (!practice_type || !artifacts) {
      return NextResponse.json({ error: 'practice_type과 artifacts가 필요합니다.' }, { status: 400 });
    }

    const engine = new EvaluationEngine(apiKey);
    const result = await engine.generateGrowthAnalysis(practice_type, artifacts);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ analysis: result });
  } catch (error) {
    console.error('[API] 성장 분석 오류:', error.message);
    return NextResponse.json({ error: `성장 분석 중 오류 발생: ${error.message}` }, { status: 500 });
  }
}
