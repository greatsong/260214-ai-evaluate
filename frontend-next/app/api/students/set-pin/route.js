import { NextResponse } from 'next/server';
import { ensureDB } from '@/lib/dbInit';
import { hashPin } from '@/lib/pin.mjs';
import { allowRequest, clientAddress } from '@/lib/attempts';
import { STUDENT_COOKIE, STUDENT_TTL_SEC, authDisabled, cookieOptions, sessionSecret, signSession } from '@/lib/session.mjs';

// 학급 전체가 처음 접속해도 걸리지 않고, 학번을 차례로 선점하는 시도는 늦추는 값이다.
const SET_PIN_LIMIT_PER_HOUR = 200;

export async function POST(request) {
  if (!authDisabled() && !sessionSecret()) {
    return NextResponse.json({ error: '서버 인증 설정이 필요합니다.' }, { status: 503 });
  }
  if (!allowRequest(`set-pin:${clientAddress(request)}`, SET_PIN_LIMIT_PER_HOUR, 60 * 60 * 1000)) {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 뒤 다시 시도해 주세요.' }, { status: 429 });
  }

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
    const updated = await db.execute({
      sql: 'UPDATE students SET pin = ? WHERE id = ? AND pin IS NULL',
      args: [hashPin(pin), student.id],
    });
    // 동시 요청에서 진 쪽은 세션을 받지 못한다
    if (updated.rowsAffected !== 1) {
      return NextResponse.json({ error: '이미 비밀번호가 설정되어 있습니다.' }, { status: 409 });
    }
  }

  const response = NextResponse.json({
    id: student.id,
    name: student.name,
    class_name: student.class_name,
    number: student.number,
    has_pin: true,
    verified: true,
  });
  if (!authDisabled()) {
    const token = await signSession({ role: 'student', id: Number(student.id) }, STUDENT_TTL_SEC);
    response.cookies.set(STUDENT_COOKIE, token, cookieOptions(STUDENT_TTL_SEC));
  }
  return response;
}
