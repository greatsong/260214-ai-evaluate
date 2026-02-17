import { NextResponse } from 'next/server';
import { ensureDB } from '@/lib/dbInit';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const artifactId = searchParams.get('artifact_id');
  const studentId = searchParams.get('student_id');
  const evalType = searchParams.get('eval_type');

  const db = await ensureDB();
  if (!db) {
    const { demoEvaluations } = await import('@/lib/demoData');
    let result = demoEvaluations.map(e => ({
      ...e,
      scores: typeof e.scores === 'string' ? JSON.parse(e.scores) : e.scores,
    }));
    if (artifactId) result = result.filter(e => e.artifact_id === Number(artifactId));
    return NextResponse.json({ success: true, data: result });
  }

  let sql = `
    SELECT e.* FROM evaluations e
    LEFT JOIN artifacts a ON e.artifact_id = a.id
    WHERE 1=1
  `;
  const args = [];
  if (artifactId) { sql += ' AND e.artifact_id = ?'; args.push(Number(artifactId)); }
  if (studentId) { sql += ' AND a.student_id = ?'; args.push(Number(studentId)); }
  if (evalType) { sql += ' AND e.eval_type = ?'; args.push(evalType); }
  sql += ' ORDER BY e.created_at DESC';

  const result = await db.execute({ sql, args });
  const evals = result.rows.map(row => ({
    ...row,
    scores: row.scores ? JSON.parse(row.scores) : {},
  }));
  return NextResponse.json({ success: true, data: evals });
}
