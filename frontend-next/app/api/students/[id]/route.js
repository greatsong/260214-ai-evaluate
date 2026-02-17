import { NextResponse } from 'next/server';
import { ensureDB } from '@/lib/dbInit';

export async function GET(request, { params }) {
  const { id } = await params;
  const db = await ensureDB();

  if (!db) {
    const { demoStudents } = await import('@/lib/demoData');
    const student = demoStudents.find(s => s.id === Number(id));
    if (!student) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '학생을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: student });
  }

  const result = await db.execute({ sql: 'SELECT * FROM students WHERE id = ?', args: [Number(id)] });
  if (result.rows.length === 0) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: '학생을 찾을 수 없습니다.' } },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: result.rows[0] });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const db = await ensureDB();

  if (!db) {
    const { demoStudents } = await import('@/lib/demoData');
    const idx = demoStudents.findIndex(s => s.id === Number(id));
    if (idx !== -1) demoStudents.splice(idx, 1);
    return NextResponse.json({ success: true, data: { deleted: true } });
  }

  await db.execute({ sql: 'DELETE FROM students WHERE id = ?', args: [Number(id)] });
  return NextResponse.json({ success: true, data: { deleted: true } });
}
