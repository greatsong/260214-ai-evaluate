import { NextResponse } from 'next/server';
import { resolveViewer } from './session.mjs';

/** 라우트 핸들러에서 현재 사용자를 판별한다. */
export function getViewer(request) {
  return resolveViewer((name) => request.cookies.get(name)?.value);
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
