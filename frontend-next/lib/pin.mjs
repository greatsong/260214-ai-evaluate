/**
 * 학생 비밀번호 해시 (Node 런타임 전용).
 * 저장 형식: scrypt$<salt hex>$<hash hex>
 * 해시 도입 전에 저장된 평문은 로그인에 성공할 때 해시로 바꾼다.
 */
import crypto from 'node:crypto';

const KEY_LENGTH = 32;
const PREFIX = 'scrypt$';

export function hashPin(pin) {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(String(pin), salt, KEY_LENGTH);
  return `${PREFIX}${salt.toString('hex')}$${derived.toString('hex')}`;
}

export function isHashedPin(stored) {
  return typeof stored === 'string' && stored.startsWith(PREFIX);
}

export function verifyPin(pin, stored) {
  if (typeof stored !== 'string' || typeof pin !== 'string') return false;
  if (!isHashedPin(stored)) return safeEqual(pin, stored);
  const [, saltHex, hashHex] = stored.split('$');
  const expected = Buffer.from(hashHex, 'hex');
  const derived = crypto.scryptSync(pin, Buffer.from(saltHex, 'hex'), expected.length);
  return crypto.timingSafeEqual(derived, expected);
}

/** 길이가 달라도 일정한 시간에 비교한다. */
export function safeEqual(a, b) {
  const left = crypto.createHash('sha256').update(String(a)).digest();
  const right = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(left, right);
}

/** 조회 단계에서 본인 확인에 필요한 만큼만 이름을 보여 준다. 예: 김민준 -> 김*준 */
export function maskName(name) {
  const chars = Array.from(String(name || ''));
  if (chars.length <= 1) return '*';
  if (chars.length === 2) return `${chars[0]}*`;
  return `${chars[0]}${'*'.repeat(chars.length - 2)}${chars[chars.length - 1]}`;
}
