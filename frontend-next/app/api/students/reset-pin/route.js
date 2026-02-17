import { NextResponse } from 'next/server';
import { ensureDB } from '@/lib/dbInit';

export async function POST(request) {
  const { student_id } = await request.json();

  if (!student_id) {
    return NextResponse.json({ error: 'student_id가 필요합니다.' }, { status: 400 });
  }

  const db = await ensureDB();

  if (!db) {
    const { demoStudents } = await import('@/lib/demoData');
    const student = demoStudents.find(s => s.id === student_id);
    if (!student) {
      return NextResponse.json({ error: '학생을 찾을 수 없습니다.' }, { status: 404 });
    }
    student.pin = null;
    return NextResponse.json({ success: true, name: student.name });
  }

  const result = await db.execute({ sql: 'SELECT name FROM students WHERE id = ?', args: [student_id] });
  if (result.rows.length === 0) {
    return NextResponse.json({ error: '학생을 찾을 수 없습니다.' }, { status: 404 });
  }

  await db.execute({ sql: 'UPDATE students SET pin = NULL WHERE id = ?', args: [student_id] });
  return NextResponse.json({ success: true, name: result.rows[0].name });
}
