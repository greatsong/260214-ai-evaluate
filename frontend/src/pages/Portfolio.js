import React, { useState } from 'react';
import axios from 'axios';
import { isDemoMode, getPortfolioFeedback } from '../services/demoData';

const API_BASE = 'http://localhost:5001/api';

export default function Portfolio({ students, demoMode }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setFeedback(null);
  };

  const handleGenerateFeedback = async () => {
    if (!selectedStudent) {
      alert('학생을 선택하세요');
      return;
    }

    if (demoMode) {
      // 데모 모드: 가상 피드백 표시
      const demoFeedback = await getPortfolioFeedback();
      setFeedback(demoFeedback);
      alert('✅ 포트폴리오 피드백이 생성되었습니다 (데모 데이터)');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/portfolio-feedback`, {
        student_id: selectedStudent.id,
        student_name: selectedStudent.name
      });

      setFeedback(response.data.feedback);
      alert('✅ 포트폴리오 피드백이 생성되었습니다');
    } catch (error) {
      alert('오류: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🎯 포트폴리오</h1>

      {students.length === 0 ? (
        <div className="alert alert-warning">학생이 없습니다</div>
      ) : (
        <>
          <div className="form-group">
            <label>학생 선택</label>
            <select
              onChange={(e) => {
                const student = students.find(s => s.id === parseInt(e.target.value));
                if (student) handleSelectStudent(student);
              }}
            >
              <option value="">선택하세요</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <>
              <div className="alert alert-info">
                선택된 학생: <strong>{selectedStudent.name}</strong>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleGenerateFeedback}
                disabled={loading}
              >
                {loading ? '생성 중...' : '💭 포트폴리오 피드백 생성'}
              </button>

              {feedback && (
                <div style={{marginTop: '2rem'}}>
                  <h2>포트폴리오 종합 피드백</h2>
                  <div className="card">
                    <p style={{whiteSpace: 'pre-wrap', lineHeight: '1.6'}}>
                      {feedback}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
