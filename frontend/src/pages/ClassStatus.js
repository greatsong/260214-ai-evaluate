import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { isDemoMode, getEvaluations } from '../services/demoData';

const API_BASE = 'http://localhost:5001/api';

export default function ClassStatus({ students, demoMode }) {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvaluations();
  }, [demoMode]);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      let response;
      
      if (demoMode) {
        const evals = await getEvaluations();
        response = { data: evals };
      } else {
        response = await axios.get(`${API_BASE}/evaluations`);
      }
      
      setEvaluations(response.data);
    } catch (error) {
      console.error('평가 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 학생별 평가 현황 계산
  const getStudentEvalCount = () => {
    const counts = {};
    students.forEach(student => {
      counts[student.id] = 0;
    });
    evaluations.forEach(evaluation => {
      // 평가의 artifact_id 기반으로 counting
      Object.keys(counts).forEach(studentId => {
        // 실제 구현에서는 artifact의 student_id를 확인
      });
    });
    return counts;
  };

  const scoreDistribution = evaluations
    .filter(e => e.total_score)
    .map(e => e.total_score);

  return (
    <div className="container">
      <h1>📊 학급 현황</h1>

      {students.length === 0 ? (
        <div className="alert alert-warning">학생이 없습니다</div>
      ) : (
        <>
          <div className="grid grid-2">
            <div>
              <h2>학생별 평가 현황</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>학생</th>
                      <th>평가 완료</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => {
                      const studentEvals = evaluations.filter(e => {
                        // 실제 student_id 연결 필요
                        return true;
                      });
                      return (
                        <tr key={student.id}>
                          <td>{student.name}</td>
                          <td>{studentEvals.length}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2>평가 점수 분포</h2>
              {scoreDistribution.length === 0 ? (
                <div className="alert alert-info">평가 데이터가 없습니다</div>
              ) : (
                <div className="metric" style={{textAlign: 'left'}}>
                  <div style={{marginBottom: '1rem'}}>
                    <strong>평균 점수:</strong> {(scoreDistribution.reduce((a, b) => a + b, 0) / scoreDistribution.length).toFixed(2)} / 4.0
                  </div>
                  <div style={{marginBottom: '1rem'}}>
                    <strong>최고 점수:</strong> {Math.max(...scoreDistribution).toFixed(2)}
                  </div>
                  <div>
                    <strong>최저 점수:</strong> {Math.min(...scoreDistribution).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>

          <h2 style={{marginTop: '2rem'}}>최근 평가</h2>
          {evaluations.length === 0 ? (
            <div className="alert alert-info">평가 기록이 없습니다</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Artifact ID</th>
                    <th>평가 타입</th>
                    <th>점수</th>
                    <th>평가일</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluations.slice(0, 20).map(evaluation => (
                    <tr key={evaluation.id}>
                      <td>#{evaluation.artifact_id}</td>
                      <td>{evaluation.eval_type}</td>
                      <td>{evaluation.total_score?.toFixed(2) || 'N/A'}</td>
                      <td>{new Date(evaluation.created_at).toLocaleDateString('ko-KR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
