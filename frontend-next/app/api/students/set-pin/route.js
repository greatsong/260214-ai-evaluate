import { NextResponse } from 'next/server';
import { ensureDB } from '@/lib/dbInit';
import { hashPin } from '@/lib/pin.mjs';
import { STUDENT_COOKIE, STUDENT_TTL_SEC, cookieOptions, signSession } from '@/lib/session.mjs';

export async function POST(request) {
  const body = await request.json();
  const { student_number, pin } = body;

  if (!student_number) {
    return NextResponse.json({ error: '학번이 필요합니다.' }, { status: 400 });
  }

  if (typeof pin !== 'string' || pin.length < 4 || pin.length > 128) {
    return NextResponse.json({ error: '비밀번호는 4자리 이상이어야 합니다.' }, { status: 400 });
  }

  const db = await ensureDB();
  let student;

  if (!db) {
    const { demoStudents } = await import('@/lib/demoData');
    student = demoStudents.find(s => s.student_number === student_number);
    if (!student) {
      return NextResponse.json({ error: '해당 학번의 학생을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (student.pin) {
      return NextResponse.json({ error: '이미 비밀번호가 설정되어 있습니다.' }, { status: 409 });
    }
    student.pin = hashPin(pin);
  } else {
    const result = await db.execute({
      sql: 'SELECT * FROM students WHERE student_number = ?',
      args: [student_number],
    });
    student = result.rows[0];
    if (!student) {
      return NextResponse.json({ error: '해당 학번의 학생을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (student.pin) {
      return NextResponse.json({ error: '이미 비밀번호가 설정되어 있습니다.' }, { status: 409 });
    }
    await db.execute({
      sql: 'UPDATE students SET pin = ? WHERE id = ? AND pin IS NULL',
      args: [hashPin(pin), student.id],
    });
  }

  const response = NextResponse.json({
    id: student.id,
    name: student.name,
    class_name: student.class_name,
    number: student.number,
    has_pin: true,
    verified: true,
  });
  const token = await signSession({ role: 'student', id: Number(student.id) }, STUDENT_TTL_SEC);
  response.cookies.set(STUDENT_COOKIE, token, cookieOptions(STUDENT_TTL_SEC));
  return response;
}
