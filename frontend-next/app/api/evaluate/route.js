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
    const { artifact_id, practice_type, raw_text, student_name } = body;

    if (!practice_type || !raw_text) {
      return NextResponse.json({ error: 'practice_type과 raw_text가 필요합니다.' }, { status: 400 });
    }

    const engine = new EvaluationEngine(apiKey);
    const result = await engine.evaluateArtifact(practice_type, raw_text, student_name);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Turso DB에 평가 결과 저장
    const db = await ensureDB();
    if (db && artifact_id) {
      const feedback = JSON.stringify({
        praise: result.praise || '',
        improvement: result.improvement || '',
        action_guide: result.action_guide || '',
      });
      await db.execute({
        sql: `INSERT INTO evaluations (artifact_id, eval_type, scores, total_score, feedback, raw_api_response)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          artifact_id, 'individual',
          JSON.stringify(result.item_scores),
          result.total_score,
          feedback,
          JSON.stringify(result),
        ],
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] 평가 오류:', error.message);
    return NextResponse.json({ error: `평가 중 오류 발생: ${error.message}` }, { status: 500 });
  }
}
