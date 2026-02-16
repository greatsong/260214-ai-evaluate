/**
 * SQLite 데이터베이스 관리
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../data/assessment.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('데이터베이스 연결 오류:', err);
      } else {
        console.log('✅ SQLite 데이터베이스 연결됨');
        this.initDB();
      }
    });
    
    // 동기식 쿼리를 위한 serialize
    this.db.configure('busyTimeout', 5000);
  }
  
  initDB() {
    // 학생 테이블
    this.db.run(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_number TEXT,
        name TEXT NOT NULL,
        class_name TEXT,
        number INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 산출물 테이블
    this.db.run(`
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
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);
    
    // 평가 결과 테이블
    this.db.run(`
      CREATE TABLE IF NOT EXISTS evaluations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        artifact_id INTEGER NOT NULL,
        eval_type TEXT NOT NULL,
        scores TEXT,
        total_score REAL,
        feedback TEXT,
        raw_api_response TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (artifact_id) REFERENCES artifacts(id)
      )
    `);
    
    // 성장 분석 테이블
    this.db.run(`
      CREATE TABLE IF NOT EXISTS growth_analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        practice_type TEXT NOT NULL,
        artifact_ids TEXT,
        analysis TEXT,
        trajectory TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);
    
    // 학번 필드가 없으면 추가 (마이그레이션)
    this.db.run(`
      PRAGMA table_info(students)
    `, (err, rows) => {
      if (!err && rows) {
        const hasStudentNumber = rows.some(col => col.name === 'student_number');
        if (!hasStudentNumber) {
          console.log('⚠️  학번 필드 추가 중...');
          this.db.run(`ALTER TABLE students ADD COLUMN student_number TEXT`, (err) => {
            if (err && err.message.includes('duplicate column')) {
              console.log('✅ 학번 필드 이미 존재');
            } else if (err) {
              console.log('⚠️  학번 필드 추가 오류:', err.message);
            } else {
              console.log('✅ 학번 필드 추가 완료');
            }
          });
        }
      }
    });
  }
  
  // ========== 학생 관리 ==========
  
  addStudent(student_number, name, class_name = '', number = 0) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO students (student_number, name, class_name, number) VALUES (?, ?, ?, ?)`,
        [student_number, name, class_name, number],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }
  
  getStudents() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM students ORDER BY class_name, number`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }
  
  getStudent(student_id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM students WHERE id = ?`,
        [student_id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }
  
  deleteStudent(student_id) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM students WHERE id = ?`,
        [student_id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
  
  // ========== 산출물 관리 ==========
  
  addArtifact(student_id, practice_type, raw_text, date = null, session = null) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO artifacts 
         (student_id, practice_type, raw_text, date, session)
         VALUES (?, ?, ?, ?, ?)`,
        [student_id, practice_type, raw_text, date, session],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }
  
  getArtifacts(student_id = null, practice_type = null) {
    return new Promise((resolve, reject) => {
      let query = `SELECT * FROM artifacts WHERE 1=1`;
      const params = [];
      
      if (student_id) {
        query += ` AND student_id = ?`;
        params.push(student_id);
      }
      if (practice_type) {
        query += ` AND practice_type = ?`;
        params.push(practice_type);
      }
      
      query += ` ORDER BY created_at DESC`;
      
      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else {
          const artifacts = (rows || []).map(row => ({
            ...row,
            structured_data: row.structured_data ? JSON.parse(row.structured_data) : null
          }));
          resolve(artifacts);
        }
      });
    });
  }
  
  getArtifact(artifact_id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM artifacts WHERE id = ?`,
        [artifact_id],
        (err, row) => {
          if (err) reject(err);
          else if (row) {
            row.structured_data = row.structured_data ? JSON.parse(row.structured_data) : null;
            resolve(row);
          }
          else resolve(null);
        }
      );
    });
  }
  
  getArtifactsByStudent(student_id) {
    return this.getArtifacts(student_id);
  }
  
  deleteArtifact(artifact_id) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM artifacts WHERE id = ?`,
        [artifact_id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
  
  // ========== 평가 관리 ==========
  
  addEvaluation(artifact_id, eval_type, scores, total_score, feedback, raw_api_response = null) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO evaluations 
         (artifact_id, eval_type, scores, total_score, feedback, raw_api_response)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [artifact_id, eval_type, scores, total_score, feedback, raw_api_response],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }
  
  getEvaluations(artifact_id = null, student_id = null, eval_type = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT e.* FROM evaluations e
        LEFT JOIN artifacts a ON e.artifact_id = a.id
        WHERE 1=1
      `;
      const params = [];
      
      if (artifact_id) {
        query += ` AND e.artifact_id = ?`;
        params.push(artifact_id);
      }
      if (student_id) {
        query += ` AND a.student_id = ?`;
        params.push(student_id);
      }
      if (eval_type) {
        query += ` AND e.eval_type = ?`;
        params.push(eval_type);
      }
      
      query += ` ORDER BY e.created_at DESC`;
      
      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else {
          const evals = (rows || []).map(row => ({
            ...row,
            scores: row.scores ? JSON.parse(row.scores) : {}
          }));
          resolve(evals);
        }
      });
    });
  }
  
  // ========== 성장 분석 ==========
  
  addGrowthAnalysis(student_id, practice_type, artifact_ids, analysis) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO growth_analyses 
         (student_id, practice_type, artifact_ids, analysis)
         VALUES (?, ?, ?, ?)`,
        [student_id, practice_type, artifact_ids, analysis],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }
  
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = Database;
