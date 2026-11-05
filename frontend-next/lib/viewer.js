import { resolveViewer } from './session.mjs';

/** 라우트 핸들러에서 현재 사용자를 판별한다. 접근 차단은 middleware.js가 먼저 수행한다. */
export function getViewer(request) {
  return resolveViewer((name) => request.cookies.get(name)?.value);
}
