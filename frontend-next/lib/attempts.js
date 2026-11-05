/**
 * 시도 횟수 제한. DB가 있으면 auth_attempts 테이블에 기록해 서버리스 인스턴스 사이에서 공유하고,
 * 없으면 인스턴스 메모리를 사용한다. 값은 비밀번호가 아니라 횟수만 저장한다.
 *
 * 비교하기 전에 먼저 횟수를 올린다. 병렬 요청이 한도 검사를 함께 통과하지 못하게 하기 위해서다.
 * 성공하면 clearFailures로 지운다.
 */
const memory = new Map();

function reserveInMemory(key, limit, windowMs, now) {
  const entry = memory.get(key);
  const active = entry && entry.resetAt > now ? entry : { count: 0, resetAt: now + windowMs };
  active.count += 1;
  memory.set(key, active);
  return active;
}

/** 시도 한 번을 예약한다. 한도를 넘었으면 남은 초를, 아니면 0을 돌려준다. */
export async function reserveAttempt(db, key, limit, windowMs) {
  const now = Date.now();
  let entry;
  if (db) {
    const result = await db.execute({
      sql: `INSERT INTO auth_attempts (key, count, reset_at) VALUES (?, 1, ?)
            ON CONFLICT(key) DO UPDATE SET
              count = CASE WHEN reset_at <= ? THEN 1 ELSE count + 1 END,
              reset_at = CASE WHEN reset_at <= ? THEN excluded.reset_at ELSE reset_at END
            RETURNING count, reset_at`,
      args: [key, now + windowMs, now, now],
    });
    entry = { count: Number(result.rows[0].count), resetAt: Number(result.rows[0].reset_at) };
  } else {
    entry = reserveInMemory(key, limit, windowMs, now);
  }
  return entry.count > limit ? Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) : 0;
}

/** @param {boolean} [withPrefix] key로 시작하는 하위 키(`key:주소`)도 함께 지운다 */
export async function clearFailures(db, key, withPrefix = false) {
  for (const stored of memory.keys()) {
    if (stored === key || (withPrefix && stored.startsWith(`${key}:`))) memory.delete(stored);
  }
  if (!db) return;
  if (withPrefix) {
    await db.execute({ sql: 'DELETE FROM auth_attempts WHERE key = ? OR key LIKE ?', args: [key, `${key}:%`] });
  } else {
    await db.execute({ sql: 'DELETE FROM auth_attempts WHERE key = ?', args: [key] });
  }
}

export function clientAddress(request) {
  return (request.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}
