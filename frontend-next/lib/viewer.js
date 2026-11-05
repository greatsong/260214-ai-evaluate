import { NextResponse } from 'next/server';
import { ensureDB } from './dbInit';
import { resolveViewer } from './session.mjs';

/** 삭제되었거나 비밀번호가 초기화된 학생의 세션을 거절한다. */
async function studentSessionIsCurrent(viewer) {
  const db = await ensureDB();
  if (!db) return true;
  const result = await db.execute({ sql: 'SELECT session_version FROM students WHERE id = ?', args: [viewer.id] });
  return result.rows.length === 1 && Number(result.rows[0].session_version) === viewer.version;
}

/** 라우트 핸들러에서 현재 사용자를 판별한다. */
export async function getViewer(request) {
  const viewer = await resolveViewer((name) => request.cookies.get(name)?.value);
  if (viewer?.role === 'student' && !(await studentSessionIsCurrent(viewer))) return null;
  return viewer;
}

function denied(status, code, message) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

/**
 * middleware.js와 별도로 핸들러에서도 권한을 확인한다.
 * 인코딩된 경로처럼 미들웨어 matcher를 벗어나는 요청이 있어도 데이터가 나가지 않게 한다.
 * @returns {Promise<{viewer: object}|{response: Response}>}
 */
export async function requireViewer(request) {
  const viewer = await getViewer(request);
  return viewer ? { viewer } : { response: denied(401, 'UNAUTHENTICATED', '로그인이 필요합니다.') };
}

export async function requireTeacher(request) {
  const viewer = await getViewer(request);
  if (!viewer) return { response: denied(401, 'UNAUTHENTICATED', '로그인이 필요합니다.') };
  if (viewer.role !== 'teacher') return { response: denied(403, 'FORBIDDEN', '교사 권한이 필요합니다.') };
  return { viewer };
}
