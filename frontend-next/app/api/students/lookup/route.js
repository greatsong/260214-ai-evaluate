import { NextResponse } from 'next/server';
import { ensureDB } from '@/lib/dbInit';
import { allowRequest, clearFailures, clientAddress, lockedSeconds, recordFailure } from '@/lib/attempts';
import { hashPin, isHashedPin, maskName, verifyPin } from '@/lib/pin.mjs';
import { STUDENT_COOKIE, STUDENT_TTL_SEC, cookieOptions, signSession } from '@/lib/session.mjs';

const PIN_FAILURE_LIMIT = 5;
const PIN_FAILURE_WINDOW_MS = 15 * 60 * 1000;
// 학교 공용 IP에서 한 학급이 동시에 조회해도 걸리지 않는 값이다
const LOOKUP_LIMIT_PER_MINUTE = 120;

async function findStudent(db, studentNumber) {
  if (!db) {
    const { demoStudents } = await import('@/lib/demoData');
    return demoStudents.find(s => s.student_number === studentNumber) || null;
  }
  const result = await db.execute({
    sql: 'SELECT * FROM students WHERE student_number = ?',
    args: [studentNumber],
  });
  return result.rows[0] || null;
}

// 1단계: 학번 확인. 본인 확인에 필요한 최소 정보만 돌려준다.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const studentNumber = searchParams.get('number');

  if (!studentNumber) {
    return NextResponse.json({ error: '학번(number)이 필요합니다.' }, { status: 400 });
  }
  if (searchParams.has('pin')) {
    return NextResponse.json({ error: '비밀번호는 주소에 넣을 수 없습니다.' }, { status: 400 });
  }
  if (!allowRequest(`lookup:${clientAddress(request)}`, LOOKUP_LIMIT_PER_MINUTE, 60 * 1000)) {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 뒤 다시 시도해 주세요.' }, { status: 429 });
  }

  const db = await ensureDB();
  const student = await findStudent(db, studentNumber);
  if (!student) {
    return NextResponse.json({ error: '해당 학번의 학생을 찾을 수 없습니다.' }, { status: 404 });
  }

  return NextResponse.json({
    name: maskName(student.name),
    class_name: student.class_name,
    has_pin: !!student.pin,
  });
}

// 2단계: 비밀번호 검증. 성공하면 학생 세션 쿠키를 발급한다.
export async function POST(request) {
  const { number: studentNumber, pin } = await request.json();

  if (typeof studentNumber !== 'string' || !studentNumber || typeof pin !== 'string' || !pin) {
    return NextResponse.json({ error: '학번과 비밀번호가 필요합니다.' }, { status: 400 });
  }

  const db = await ensureDB();
  const attemptKey = `pin:${studentNumber}`;
  const wait = await lockedSeconds(db, attemptKey, PIN_FAILURE_LIMIT);
  if (wait > 0) {
    return NextResponse.json(
      { error: `비밀번호를 여러 번 틀렸습니다. ${Math.ceil(wait / 60)}분 뒤 다시 시도하거나 선생님께 초기화를 요청하세요.` },
      { status: 429 }
    );
  }

  const student = await findStudent(db, studentNumber);
  if (!student) {
    return NextResponse.json({ error: '해당 학번의 학생을 찾을 수 없습니다.' }, { status: 404 });
  }
  if (!student.pin) {
    return NextResponse.json({ error: '비밀번호가 설정되지 않았습니다. 먼저 비밀번호를 설정하세요.' }, { status: 400 });
  }
  if (!verifyPin(pin, student.pin)) {
    await recordFailure(db, attemptKey, PIN_FAILURE_WINDOW_MS);
    return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
  }

  await clearFailures(db, attemptKey);

  // 해시 도입 전에 평문으로 저장된 값을 바꾼다
  if (db && !isHashedPin(student.pin)) {
    await db.execute({ sql: 'UPDATE students SET pin = ? WHERE id = ?', args: [hashPin(pin), student.id] });
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
