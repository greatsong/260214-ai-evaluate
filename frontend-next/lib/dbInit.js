/**
 * Turso DB 스키마 초기화
 * 첫 API 호출 시 한 번만 실행.
 */
import { getTurso } from './turso';

let _initialized = false;

export async function ensureDB() {
  const db = getTurso();
  if (!db || _initialized) return db;

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_number TEXT,
      name TEXT NOT NULL,
      class_name TEXT,
      number INTEGER,
      pin TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS artifacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      practice_type TEXT NOT NULL,
      raw_text TEXT NOT NULL,
      structured_data TEXT,
      date TEXT,
      session TEXT,
      sequence INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      artifact_id INTEGER NOT NULL,
      eval_type TEXT NOT NULL,
      scores TEXT,
      total_score REAL,
      feedback TEXT,
      raw_api_response TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (artifact_id) REFERENCES artifacts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS growth_analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      practice_type TEXT NOT NULL,
      artifact_ids TEXT,
      analysis TEXT,
      trajectory TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS auth_attempts (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL,
      reset_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_artifacts_student_id ON artifacts(student_id);
    CREATE INDEX IF NOT EXISTS idx_artifacts_practice_type ON artifacts(practice_type);
    CREATE INDEX IF NOT EXISTS idx_evaluations_artifact_id ON evaluations(artifact_id);
    CREATE INDEX IF NOT EXISTS idx_students_student_number ON students(student_number);
  `);

  // 교사가 비밀번호를 초기화하면 기존 학생 세션을 끊기 위한 값. 이미 있으면 무시한다.
  try {
    await db.execute('ALTER TABLE students ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0');
  } catch {
    // 이미 존재
  }

  _initialized = true;
  return db;
}
