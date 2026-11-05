/**
 * 서명 세션 쿠키 (Edge 미들웨어와 Node API 라우트에서 함께 사용).
 * Web Crypto만 사용하므로 두 런타임에서 동작한다.
 *
 * 토큰 형식: base64url(JSON payload).base64url(HMAC-SHA256)
 * 서명 키는 SESSION_SECRET이다. 학생도 자기 쿠키를 볼 수 있으므로 사람이 정한 비밀번호로
 * 서명하면 오프라인 대입으로 교사 세션을 위조할 수 있다. 그래서 운영에서는 다른 값으로 대체하지 않는다.
 */

export const TEACHER_COOKIE = 'ae_teacher';
export const STUDENT_COOKIE = 'ae_student';
export const TEACHER_TTL_SEC = 8 * 60 * 60;
export const STUDENT_TTL_SEC = 2 * 60 * 60;

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function b64urlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (str.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Next는 process.env.NODE_ENV 리터럴만 빌드 때 치환한다. 런타임 env에 값이 없어도 운영으로 판단되게 한다.
function isProduction(env) {
  return (env.NODE_ENV ?? process.env.NODE_ENV) === 'production';
}

export function sessionSecret(env = process.env) {
  if (env.SESSION_SECRET) return env.SESSION_SECRET;
  return isProduction(env) ? '' : (env.TEACHER_PASSWORD || '');
}

/**
 * 로컬 개발에서 비밀값을 하나도 설정하지 않은 경우에만 인증을 끈다.
 * 운영(NODE_ENV=production)에서는 비밀값이 없으면 API를 열지 않는다.
 */
export function authDisabled(env = process.env) {
  return !isProduction(env) && !sessionSecret(env);
}

async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signSession(claims, ttlSec, secret = sessionSecret()) {
  if (!secret) throw new Error('세션 비밀값이 설정되지 않았습니다.');
  const payload = b64url(enc.encode(JSON.stringify({ ...claims, exp: Math.floor(Date.now() / 1000) + ttlSec })));
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(payload)));
  return `${payload}.${b64url(signature)}`;
}

export async function verifySession(token, secret = sessionSecret()) {
  if (!secret || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  try {
    const valid = await crypto.subtle.verify('HMAC', await hmacKey(secret), b64urlDecode(parts[1]), enc.encode(parts[0]));
    if (!valid) return null;
    const claims = JSON.parse(dec.decode(b64urlDecode(parts[0])));
    if (typeof claims.exp !== 'number' || claims.exp < Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

/**
 * 요청의 쿠키에서 사용자를 판별한다.
 * @param {(name: string) => string|undefined} readCookie
 * @returns {Promise<{role:'teacher'}|{role:'student',id:number}|null>}
 */
export async function resolveViewer(readCookie, env = process.env) {
  if (authDisabled(env)) return { role: 'teacher' };
  const secret = sessionSecret(env);
  const teacher = await verifySession(readCookie(TEACHER_COOKIE), secret);
  if (teacher?.role === 'teacher') return { role: 'teacher' };
  const student = await verifySession(readCookie(STUDENT_COOKIE), secret);
  if (student?.role === 'student' && Number.isInteger(student.id)) return { role: 'student', id: student.id };
  return null;
}

/**
 * /api 경로별 접근 규칙. 목록에 없는 경로는 교사 전용이다.
 * @returns {'public'|'student'|'teacher'}
 */
export function accessLevel(method, pathname) {
  const path = pathname.replace(/\/+$/, '');
  if (path === '/api/auth' || path === '/api/health') return 'public';
  if (path === '/api/rubrics' && method === 'GET') return 'public';
  if (path === '/api/students/lookup') return 'public';
  if (path === '/api/students/set-pin' && method === 'POST') return 'public';
  if (path === '/api/artifacts' && (method === 'GET' || method === 'POST')) return 'student';
  if (path === '/api/evaluations' && method === 'GET') return 'student';
  return 'teacher';
}

export function cookieOptions(maxAge, env = process.env) {
  return {
    httpOnly: true,
    secure: isProduction(env),
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}
