import { NextResponse } from 'next/server';
import EvaluationEngine from '@/lib/evaluationEngine';
import { ensureDB } from '@/lib/dbInit';

export async function POST(request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.' }, { status: 500 });
    }

    const body = await request.json();
    const { student_id, practice_type, artifacts } = body;

    if (!practice_type || !artifacts) {
      return NextResponse.json({ error: 'practice_type과 artifacts가 필요합니다.' }, { status: 400 });
    }

    const engine = new EvaluationEngine(apiKey);
    const result = await engine.generateGrowthAnalysis(practice_type, artifacts);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Turso DB에 성장 분석 결과 저장
    const db = await ensureDB();
    if (db && student_id) {
      const artifactIds = artifacts.map(a => a.id).filter(Boolean);
      await db.execute({
        sql: `INSERT INTO growth_analyses (student_id, practice_type, artifact_ids, analysis)
              VALUES (?, ?, ?, ?)`,
        args: [
          student_id,
          practice_type,
          JSON.stringify(artifactIds),
          JSON.stringify(result),
        ],
      });
    }

    return NextResponse.json({ analysis: result });
  } catch (error) {
    console.error('[API] 성장 분석 오류:', error.message);
    return NextResponse.json({ error: `성장 분석 중 오류 발생: ${error.message}` }, { status: 500 });
  }
}
