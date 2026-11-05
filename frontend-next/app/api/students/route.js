import { NextResponse } from 'next/server';
import { ensureDB } from '@/lib/dbInit';
import { requireTeacher } from '@/lib/viewer';

export async function GET(request) {
  const gate = await requireTeacher(request);
  if (gate.response) return gate.response;

  const db = await ensureDB();
  if (!db) {
    const { demoStudents } = await import('@/lib/demoData');
    const data = demoStudents.map(({ pin, ...student }) => ({ ...student, has_pin: !!pin }));
    return NextResponse.json({ success: true, data });
  }

  // pin 열은 응답에 넣지 않는다
  const result = await db.execute(
    `SELECT id, student_number, name, class_name, number, created_at, pin IS NOT NULL AS has_pin
     FROM students ORDER BY class_name, number`
  );
  return NextResponse.json({ success: true, data: result.rows });
}

export async function POST(request) {
  const gate = await requireTeacher(request);
  if (gate.response) return gate.response;

  const body = await request.json();
  const { student_number, name, class_name, number } = body;

  if (!student_number || !name) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION', message: '학번과 이름은 필수입니다.' } },
      { status: 400 }
    );
  }

  const db = await ensureDB();
  if (!db) {
    const { demoStudents } = await import('@/lib/demoData');
    const newId = demoStudents.length > 0 ? Math.max(...demoStudents.map(s => s.id)) + 1 : 1;
    const s = { id: newId, student_number, name, class_name, number, created_at: new Date().toISOString() };
    demoStudents.push(s);
    return NextResponse.json({ success: true, data: { id: newId, student_number, name } }, { status: 201 });
  }

  const result = await db.execute({
    sql: 'INSERT INTO students (student_number, name, class_name, number) VALUES (?, ?, ?, ?)',
    args: [student_number, name, class_name || '', number || 0],
  });

  return NextResponse.json(
    { success: true, data: { id: Number(result.lastInsertRowid), student_number, name } },
    { status: 201 }
  );
}
