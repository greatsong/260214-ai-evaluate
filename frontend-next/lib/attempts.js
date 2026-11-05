/**
 * 실패 횟수 제한. DB가 있으면 auth_attempts 테이블에 기록해 서버리스 인스턴스 사이에서 공유하고,
 * 없으면 인스턴스 메모리를 사용한다. 값은 비밀번호가 아니라 횟수만 저장한다.
 */
const memory = new Map();

function readMemory(key, now) {
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) return { count: 0, resetAt: 0 };
  return entry;
}

async function read(db, key, now) {
  if (!db) return readMemory(key, now);
  const result = await db.execute({ sql: 'SELECT count, reset_at FROM auth_attempts WHERE key = ?', args: [key] });
  const row = result.rows[0];
  if (!row || Number(row.reset_at) <= now) return { count: 0, resetAt: 0 };
  return { count: Number(row.count), resetAt: Number(row.reset_at) };
}

/** 한도를 넘었으면 남은 초를, 아니면 0을 돌려준다. */
export async function lockedSeconds(db, key, limit) {
  const now = Date.now();
  const { count, resetAt } = await read(db, key, now);
  return count >= limit ? Math.ceil((resetAt - now) / 1000) : 0;
}

export async function recordFailure(db, key, windowMs) {
  const now = Date.now();
  const current = await read(db, key, now);
  const next = { count: current.count + 1, resetAt: current.resetAt || now + windowMs };
  if (!db) {
    memory.set(key, next);
    return;
  }
  await db.execute({
    sql: `INSERT INTO auth_attempts (key, count, reset_at) VALUES (?, ?, ?)
          ON CONFLICT(key) DO UPDATE SET count = excluded.count, reset_at = excluded.reset_at`,
    args: [key, next.count, next.resetAt],
  });
}

export async function clearFailures(db, key) {
  memory.delete(key);
  if (db) await db.execute({ sql: 'DELETE FROM auth_attempts WHERE key = ?', args: [key] });
}

/** 요청 횟수 제한(메모리). 학번을 차례로 넣어 보는 조회를 늦춘다. */
export function allowRequest(key, limit, windowMs) {
  const now = Date.now();
  const entry = readMemory(key, now);
  if (entry.count >= limit) return false;
  memory.set(key, { count: entry.count + 1, resetAt: entry.resetAt || now + windowMs });
  return true;
}

export function clientAddress(request) {
  return (request.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}
