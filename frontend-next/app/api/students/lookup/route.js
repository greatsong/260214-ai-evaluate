import { NextResponse } from 'next/server';
import { ensureDB } from '@/lib/dbInit';
import { clearFailures, clientAddress, reserveAttempt } from '@/lib/attempts';
import { hashPin, isHashedPin, maskName, verifyPin } from '@/lib/pin.mjs';
import { STUDENT_COOKIE, STUDENT_TTL_SEC, TEACHER_COOKIE, authDisabled, cookieOptions, signSession } from '@/lib/session.mjs';

// 주소별 한도가 먼저 걸린다. 학번 전체 한도는 여러 주소에서 나누어 대입하는 경우를 막는다.
// 학번만으로 잠그면 한 학생이 학급 전원을 잠글 수 있어 주소를 함께 본다.
const PIN_FAILURE_LIMIT_PER_ADDRESS = 5;
const PIN_FAILURE_LIMIT_PER_STUDENT = 30;
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
  const db = await ensureDB();
  if (await reserveAttempt(db, `rate:lookup:${clientAddress(request)}`, LOOKUP_LIMIT_PER_MINUTE, 60 * 1000)) {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 뒤 다시 시도해 주세요.' }, { status: 429 });
  }

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

  const address = clientAddress(request);
  const db = await ensureDB();
  if (await reserveAttempt(db, `rate:pin:${address}`, LOOKUP_LIMIT_PER_MINUTE, 60 * 1000)) {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 뒤 다시 시도해 주세요.' }, { status: 429 });
  }

  const attemptKey = `pin:${studentNumber}`;
  const wait = await reserveAttempt(db, `${attemptKey}:${address}`, PIN_FAILURE_LIMIT_PER_ADDRESS, PIN_FAILURE_WINDOW_MS)
    || await reserveAttempt(db, attemptKey, PIN_FAILURE_LIMIT_PER_STUDENT, PIN_FAILURE_WINDOW_MS);
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
    return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
  }

  // 해시 도입 전에 평문으로 저장된 값을 바꾼다. 그사이 교사가 초기화했으면 예전 비밀번호를 되살리지 않는다.
  if (db && !isHashedPin(student.pin)) {
    const upgraded = await db.execute({
      sql: 'UPDATE students SET pin = ? WHERE id = ? AND pin = ? AND session_version = ?',
      args: [hashPin(pin), student.id, student.pin, student.session_version ?? 0],
    });
    if (upgraded.rowsAffected !== 1) {
      return NextResponse.json({ error: '비밀번호가 변경되었습니다. 다시 확인해 주세요.' }, { status: 409 });
    }
  }

  await clearFailures(db, attemptKey, true);

  const response = NextResponse.json({
    id: student.id,
    name: student.name,
    class_name: student.class_name,
    number: student.number,
    has_pin: true,
    verified: true,
  });
  if (!authDisabled()) {
    const token = await signSession(
      { role: 'student', id: Number(student.id), v: Number(student.session_version) || 0 },
      STUDENT_TTL_SEC
    );
    response.cookies.set(STUDENT_COOKIE, token, cookieOptions(STUDENT_TTL_SEC));
    // 공용 브라우저에 남은 교사 세션이 학생 화면에서 동작하지 않게 한다
    response.cookies.set(TEACHER_COOKIE, '', cookieOptions(0));
  }
  return response;
}
