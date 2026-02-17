/**
 * Turso (libSQL) 클라이언트
 * TURSO_DATABASE_URL과 TURSO_AUTH_TOKEN 환경변수가 있을 때만 연결.
 * 없으면 null 반환 → 데모 모드 폴백.
 */
import { createClient } from '@libsql/client';

let _client = null;

export function getTurso() {
  if (_client) return _client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) return null;

  _client = createClient({ url, authToken });
  return _client;
}
