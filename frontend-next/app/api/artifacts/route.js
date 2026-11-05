import { NextResponse } from 'next/server';
import { ensureDB } from '@/lib/dbInit';
import { getViewer } from '@/lib/viewer';

const MAX_RAW_TEXT_LENGTH = 200000;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const viewer = await getViewer(request);
  // 학생은 쿼리와 관계없이 본인 산출물만 조회한다
  const studentId = viewer?.role === 'student' ? viewer.id : searchParams.get('student_id');
  const practiceType = searchParams.get('practice_type');

  const db = await ensureDB();
  if (!db) {
    const { demoArtifacts } = await import('@/lib/demoData');
    let result = [...demoArtifacts];
    if (studentId) result = result.filter(a => a.student_id === Number(studentId));
    if (practiceType) result = result.filter(a => a.practice_type === practiceType);
    return NextResponse.json({ success: true, data: result });
  }

  let sql = 'SELECT * FROM artifacts WHERE 1=1';
  const args = [];
  if (studentId) { sql += ' AND student_id = ?'; args.push(Number(studentId)); }
  if (practiceType) { sql += ' AND practice_type = ?'; args.push(practiceType); }
  sql += ' ORDER BY created_at DESC';

  const result = await db.execute({ sql, args });
  return NextResponse.json({ success: true, data: result.rows });
}

export async function POST(request) {
  const body = await request.json();
  const { practice_type, raw_text, date, session } = body;
  const viewer = await getViewer(request);
  // 학생은 본문의 student_id가 아니라 세션의 본인 id로만 제출한다
  const student_id = viewer?.role === 'student' ? viewer.id : body.student_id;

  if (typeof raw_text === 'string' && raw_text.length > MAX_RAW_TEXT_LENGTH) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION', message: '산출물이 너무 깁니다.' } },
      { status: 413 }
    );
  }

  if (!student_id || !practice_type || !raw_text) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION', message: 'student_id, practice_type, raw_text가 필요합니다.' } },
      { status: 400 }
    );
  }

  const db = await ensureDB();
  if (!db) {
    const { demoArtifacts } = await import('@/lib/demoData');
    const newId = demoArtifacts.length > 0 ? Math.max(...demoArtifacts.map(a => a.id)) + 1 : 1;
    const a = { id: newId, student_id, practice_type, raw_text, date, session, created_at: new Date().toISOString() };
    demoArtifacts.push(a);
    return NextResponse.json({ success: true, data: { id: newId, student_id, practice_type } }, { status: 201 });
  }

  const result = await db.execute({
    sql: 'INSERT INTO artifacts (student_id, practice_type, raw_text, date, session) VALUES (?, ?, ?, ?, ?)',
    args: [student_id, practice_type, raw_text, date || null, session || null],
  });

  return NextResponse.json(
    { success: true, data: { id: Number(result.lastInsertRowid), student_id, practice_type } },
    { status: 201 }
  );
}
