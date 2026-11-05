import { NextResponse } from 'next/server';
import { accessLevel, authDisabled, resolveViewer, sessionSecret } from './lib/session.mjs';

function deny(status, code, message) {
  return NextResponse.json({ success: false, error: { code, message } }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function middleware(request) {
  const level = accessLevel(request.method, request.nextUrl.pathname);

  if (level !== 'public') {
    if (!sessionSecret() && !authDisabled()) {
      return deny(503, 'AUTH_NOT_CONFIGURED', '서버 인증 설정이 필요합니다.');
    }
    const viewer = await resolveViewer((name) => request.cookies.get(name)?.value);
    if (!viewer) return deny(401, 'UNAUTHENTICATED', '로그인이 필요합니다.');
    if (level === 'teacher' && viewer.role !== 'teacher') {
      return deny(403, 'FORBIDDEN', '교사 권한이 필요합니다.');
    }
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export const config = { matcher: '/api/:path*' };
