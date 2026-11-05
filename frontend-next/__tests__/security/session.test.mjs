import assert from 'node:assert/strict';
import test from 'node:test';
import { accessLevel, authDisabled, resolveViewer, sessionSecret, signSession, verifySession, TEACHER_COOKIE, STUDENT_COOKIE } from '../../lib/session.mjs';
import { hashPin, isHashedPin, maskName, safeEqual, verifyPin } from '../../lib/pin.mjs';

const env = { NODE_ENV: 'production', SESSION_SECRET: 'test-only-secret' };

test('서명한 세션은 검증되고, 위조·만료·다른 키는 거절된다', async () => {
  const token = await signSession({ role: 'teacher' }, 60, 'k1');
  assert.equal((await verifySession(token, 'k1')).role, 'teacher');
  assert.equal(await verifySession(token, 'k2'), null);
  const [payload, sig] = token.split('.');
  const forged = Buffer.from(JSON.stringify({ role: 'teacher', exp: 9999999999 })).toString('base64url');
  assert.equal(await verifySession(`${forged}.${sig}`, 'k1'), null);
  assert.equal(await verifySession(`${payload}.`, 'k1'), null);
  assert.equal(await verifySession(await signSession({ role: 'teacher' }, -1, 'k1'), 'k1'), null);
});

test('학생 쿠키를 교사 쿠키 자리에 넣어도 교사가 되지 않는다', async () => {
  const student = await signSession({ role: 'student', id: 7 }, 60, env.SESSION_SECRET);
  const swapped = await resolveViewer((name) => (name === TEACHER_COOKIE ? student : undefined), env);
  assert.equal(swapped, null);
  const normal = await resolveViewer((name) => (name === STUDENT_COOKIE ? student : undefined), env);
  assert.deepEqual(normal, { role: 'student', id: 7, version: 0 });
});

test('운영에서 비밀값이 없으면 인증이 꺼지지 않는다', async () => {
  assert.equal(authDisabled({ NODE_ENV: 'production' }), false);
  assert.equal(await resolveViewer(() => undefined, { NODE_ENV: 'production' }), null);
  assert.equal(authDisabled({ NODE_ENV: 'development' }), true);
  assert.equal(authDisabled({ NODE_ENV: 'development', TEACHER_PASSWORD: 'x' }), false);
});

test('운영에서는 교사 비밀번호로 세션을 서명하지 않는다', async () => {
  const env = { NODE_ENV: 'production', TEACHER_PASSWORD: 'guessable' };
  assert.equal(sessionSecret(env), '');
  const forged = await signSession({ role: 'teacher' }, 60, 'guessable');
  assert.equal(await resolveViewer(() => forged, env), null);
  assert.equal(sessionSecret({ NODE_ENV: 'development', TEACHER_PASSWORD: 'x' }), 'x');
});

test('경로별 접근 규칙', () => {
  const cases = [
    ['GET', '/api/students', 'teacher'], ['POST', '/api/students', 'teacher'],
    ['GET', '/api/students/1', 'teacher'], ['DELETE', '/api/students/1', 'teacher'],
    ['POST', '/api/students/reset-pin', 'teacher'],
    ['GET', '/api/students/lookup', 'public'], ['POST', '/api/students/lookup', 'public'],
    ['POST', '/api/students/set-pin', 'public'],
    ['GET', '/api/artifacts', 'student'], ['POST', '/api/artifacts', 'student'],
    ['GET', '/api/artifacts/3', 'teacher'], ['DELETE', '/api/artifacts/3', 'teacher'],
    ['GET', '/api/evaluations', 'student'],
    ['POST', '/api/evaluate', 'teacher'], ['POST', '/api/growth-analysis', 'teacher'],
    ['POST', '/api/portfolio-feedback', 'teacher'], ['POST', '/api/school-record', 'teacher'],
    ['GET', '/api/health', 'public'], ['GET', '/api/rubrics', 'public'], ['POST', '/api/auth', 'public'],
    ['GET', '/api/unknown', 'teacher'], ['GET', '/api/students/', 'teacher'],
  ];
  for (const [method, path, expected] of cases) assert.equal(accessLevel(method, path), expected, `${method} ${path}`);
});

test('비밀번호는 해시로 저장하고, 예전 평문도 검증된다', () => {
  const stored = hashPin('1234');
  assert.ok(isHashedPin(stored));
  assert.ok(!stored.includes('1234'));
  assert.ok(verifyPin('1234', stored));
  assert.ok(!verifyPin('1235', stored));
  assert.notEqual(hashPin('1234'), stored);
  assert.ok(verifyPin('abcd', 'abcd'));
  assert.ok(!verifyPin('abce', 'abcd'));
  assert.ok(safeEqual('a', 'a'));
  assert.ok(!safeEqual('a', 'ab'));
});

test('조회 단계의 이름은 가려서 보여 준다', () => {
  assert.equal(maskName('김민준'), '김*준');
  assert.equal(maskName('남궁민수'), '남**수');
  assert.equal(maskName('이준'), '이*');
  assert.equal(maskName(''), '*');
});
