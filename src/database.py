import sqlite3
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

DB_PATH = Path(__file__).parent.parent / "data" / "assessment.db"


class AssessmentDB:
    """AI 교실 실천 평가 시스템 데이터베이스"""
    
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.init_db()
    
    def get_connection(self):
        """데이터베이스 연결 반환"""
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_db(self):
        """데이터베이스 초기화 및 테이블 생성"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # 학생 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                class_name TEXT,
                number INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 산출물 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS artifacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                practice_type TEXT NOT NULL,
                raw_text TEXT NOT NULL,
                structured_data TEXT,
                date DATE,
                session TEXT,
                sequence INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        """)
        
        # 평가 결과 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS evaluations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                artifact_id INTEGER NOT NULL,
                eval_type TEXT NOT NULL,
                scores TEXT,
                total_score REAL,
                feedback TEXT,
                raw_api_response TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (artifact_id) REFERENCES artifacts(id)
            )
        """)
        
        # 성장 분석 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS growth_analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                practice_type TEXT NOT NULL,
                artifact_ids TEXT,
                analysis TEXT,
                trajectory TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        """)
        
        conn.commit()
        conn.close()
    
    # ========== 학생 관리 ==========
    
    def add_student(self, name: str, class_name: str = "", number: int = 0) -> int:
        """학생 추가"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO students (name, class_name, number) VALUES (?, ?, ?)",
            (name, class_name, number)
        )
        conn.commit()
        student_id = cursor.lastrowid
        conn.close()
        return student_id
    
    def get_students(self) -> List[Dict[str, Any]]:
        """모든 학생 조회"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM students ORDER BY class_name, number")
        students = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return students
    
    def get_student(self, student_id: int) -> Optional[Dict[str, Any]]:
        """특정 학생 조회"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None
    
    def delete_student(self, student_id: int):
        """학생 삭제"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM students WHERE id = ?", (student_id,))
        conn.commit()
        conn.close()
    
    # ========== 산출물 관리 ==========
    
    def add_artifact(
        self,
        student_id: int,
        practice_type: str,
        raw_text: str,
        structured_data: Dict = None,
        date: str = None,
        session: str = None,
        sequence: int = None
    ) -> int:
        """산출물 추가"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        structured_json = json.dumps(structured_data) if structured_data else None
        cursor.execute(
            """INSERT INTO artifacts 
               (student_id, practice_type, raw_text, structured_data, date, session, sequence)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (student_id, practice_type, raw_text, structured_json, date, session, sequence)
        )
        conn.commit()
        artifact_id = cursor.lastrowid
        conn.close()
        return artifact_id
    
    def get_artifacts(
        self,
        student_id: int = None,
        practice_type: str = None
    ) -> List[Dict[str, Any]]:
        """산출물 조회"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM artifacts WHERE 1=1"
        params = []
        
        if student_id:
            query += " AND student_id = ?"
            params.append(student_id)
        if practice_type:
            query += " AND practice_type = ?"
            params.append(practice_type)
        
        query += " ORDER BY created_at DESC"
        cursor.execute(query, params)
        
        artifacts = []
        for row in cursor.fetchall():
            artifact = dict(row)
            if artifact['structured_data']:
                artifact['structured_data'] = json.loads(artifact['structured_data'])
            artifacts.append(artifact)
        
        conn.close()
        return artifacts
    
    def get_artifact(self, artifact_id: int) -> Optional[Dict[str, Any]]:
        """특정 산출물 조회"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM artifacts WHERE id = ?", (artifact_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        artifact = dict(row)
        if artifact['structured_data']:
            artifact['structured_data'] = json.loads(artifact['structured_data'])
        return artifact
    
    def delete_artifact(self, artifact_id: int):
        """산출물 삭제"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM artifacts WHERE id = ?", (artifact_id,))
        conn.commit()
        conn.close()
    
    # ========== 평가 관리 ==========
    
    def add_evaluation(
        self,
        artifact_id: int,
        eval_type: str,
        scores: Dict[str, float],
        total_score: float,
        feedback: str,
        raw_api_response: str = None
    ) -> int:
        """평가 결과 저장"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        scores_json = json.dumps(scores)
        cursor.execute(
            """INSERT INTO evaluations 
               (artifact_id, eval_type, scores, total_score, feedback, raw_api_response)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (artifact_id, eval_type, scores_json, total_score, feedback, raw_api_response)
        )
        conn.commit()
        eval_id = cursor.lastrowid
        conn.close()
        return eval_id
    
    def get_evaluations(
        self,
        artifact_id: int = None,
        student_id: int = None,
        eval_type: str = None
    ) -> List[Dict[str, Any]]:
        """평가 결과 조회"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT e.* FROM evaluations e
            LEFT JOIN artifacts a ON e.artifact_id = a.id
            WHERE 1=1
        """
        params = []
        
        if artifact_id:
            query += " AND e.artifact_id = ?"
            params.append(artifact_id)
        if student_id:
            query += " AND a.student_id = ?"
            params.append(student_id)
        if eval_type:
            query += " AND e.eval_type = ?"
            params.append(eval_type)
        
        query += " ORDER BY e.created_at DESC"
        cursor.execute(query, params)
        
        evaluations = []
        for row in cursor.fetchall():
            eval_result = dict(row)
            if eval_result['scores']:
                eval_result['scores'] = json.loads(eval_result['scores'])
            evaluations.append(eval_result)
        
        conn.close()
        return evaluations
    
    def get_evaluation(self, eval_id: int) -> Optional[Dict[str, Any]]:
        """특정 평가 결과 조회"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM evaluations WHERE id = ?", (eval_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        eval_result = dict(row)
        if eval_result['scores']:
            eval_result['scores'] = json.loads(eval_result['scores'])
        return eval_result
    
    # ========== 성장 분석 ==========
    
    def add_growth_analysis(
        self,
        student_id: int,
        practice_type: str,
        artifact_ids: List[int],
        analysis: str,
        trajectory: Dict = None
    ) -> int:
        """성장 분석 저장"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        artifact_ids_json = json.dumps(artifact_ids)
        trajectory_json = json.dumps(trajectory) if trajectory else None
        
        cursor.execute(
            """INSERT INTO growth_analyses 
               (student_id, practice_type, artifact_ids, analysis, trajectory)
               VALUES (?, ?, ?, ?, ?)""",
            (student_id, practice_type, artifact_ids_json, analysis, trajectory_json)
        )
        conn.commit()
        analysis_id = cursor.lastrowid
        conn.close()
        return analysis_id
    
    def get_growth_analyses(
        self,
        student_id: int = None,
        practice_type: str = None
    ) -> List[Dict[str, Any]]:
        """성장 분석 조회"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM growth_analyses WHERE 1=1"
        params = []
        
        if student_id:
            query += " AND student_id = ?"
            params.append(student_id)
        if practice_type:
            query += " AND practice_type = ?"
            params.append(practice_type)
        
        query += " ORDER BY created_at DESC"
        cursor.execute(query, params)
        
        analyses = []
        for row in cursor.fetchall():
            analysis = dict(row)
            if analysis['artifact_ids']:
                analysis['artifact_ids'] = json.loads(analysis['artifact_ids'])
            if analysis['trajectory']:
                analysis['trajectory'] = json.loads(analysis['trajectory'])
            analyses.append(analysis)
        
        conn.close()
        return analyses
