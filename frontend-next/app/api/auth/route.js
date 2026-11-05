import { NextResponse } from 'next/server';
import { ensureDB } from '@/lib/dbInit';
import { clearFailures, clientAddress, lockedSeconds, recordFailure } from '@/lib/attempts';
import { safeEqual } from '@/lib/pin.mjs';
import { getViewer } from '@/lib/viewer';
import {
  STUDENT_COOKIE, TEACHER_COOKIE, TEACHER_TTL_SEC, authDisabled, cookieOptions, signSession,
} from '@/lib/session.mjs';

const FAILURE_LIMIT = 10;
const FAILURE_WINDOW_MS = 15 * 60 * 1000;

// 현재 세션 확인 (AuthGuard가 사용)
export async function GET(request) {
  const viewer = await getViewer(request);
  return NextResponse.json({ success: true, data: { authenticated: viewer?.role === 'teacher' } });
}

export async function POST(request) {
  if (authDisabled()) {
    // 비밀번호가 설정되지 않은 로컬 개발 환경
    return NextResponse.json({ success: true, data: { authenticated: true } });
  }

  const teacherPassword = process.env.TEACHER_PASSWORD;
  if (!teacherPassword) {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_NOT_CONFIGURED', message: 'TEACHER_PASSWORD 환경변수를 설정해야 합니다.' } },
      { status: 503 }
    );
  }

  const db = await ensureDB();
  const attemptKey = `teacher:${clientAddress(request)}`;
  const wait = await lockedSeconds(db, attemptKey, FAILURE_LIMIT);
  if (wait > 0) {
    return NextResponse.json(
      { success: false, error: { code: 'TOO_MANY_ATTEMPTS', message: `시도가 너무 많습니다. ${Math.ceil(wait / 60)}분 뒤 다시 시도해 주세요.` } },
      { status: 429 }
    );
  }

  const { password } = await request.json();
  if (typeof password === 'string' && safeEqual(password, teacherPassword)) {
    await clearFailures(db, attemptKey);
    const response = NextResponse.json({ success: true, data: { authenticated: true } });
    response.cookies.set(TEACHER_COOKIE, await signSession({ role: 'teacher' }, TEACHER_TTL_SEC), cookieOptions(TEACHER_TTL_SEC));
    return response;
  }

  await recordFailure(db, attemptKey, FAILURE_WINDOW_MS);
  return NextResponse.json(
    { success: false, error: { code: 'AUTH_FAILED', message: '비밀번호가 올바르지 않습니다.' } },
    { status: 401 }
  );
}

// 로그아웃
export async function DELETE() {
  const response = NextResponse.json({ success: true, data: { authenticated: false } });
  response.cookies.set(TEACHER_COOKIE, '', cookieOptions(0));
  response.cookies.set(STUDENT_COOKIE, '', cookieOptions(0));
  return response;
}
