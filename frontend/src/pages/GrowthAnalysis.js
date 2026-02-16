import React, { useState } from 'react';
import axios from 'axios';
import { isDemoMode, getArtifacts, getGrowthAnalyses } from '../services/demoData';

const API_BASE = 'http://localhost:5001/api';
const PRACTICE_TYPES = {
  p1_discomfort: '불편함 수집',
  p2_comparison: 'AI와 비교',
  p3_definition: '문제 정의서',
  p4_ai_log: 'AI 활용 일지',
  p7_reflection: '성장 성찰'
};

export default function GrowthAnalysis({ students, demoMode }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPractice, setSelectedPractice] = useState('p1_discomfort');
  const [artifacts, setArtifacts] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setAnalysis(null);
    
    try {
      let response;
      
      if (demoMode) {
        const allArtifacts = await getArtifacts(student.id, selectedPractice);
        response = { data: allArtifacts };
      } else {
        response = await axios.get(
          `${API_BASE}/artifacts?student_id=${student.id}&practice_type=${selectedPractice}`
        );
      }
      
      setArtifacts(response.data);
    } catch (error) {
      console.error('산출물 조회 오류:', error);
    }
  };

  const handleSelectPractice = async (e) => {
    const practice = e.target.value;
    setSelectedPractice(practice);
    setAnalysis(null);

    if (selectedStudent) {
      try {
        let response;
        
        if (demoMode) {
          const allArtifacts = await getArtifacts(selectedStudent.id, practice);
          response = { data: allArtifacts };
        } else {
          response = await axios.get(
            `${API_BASE}/artifacts?student_id=${selectedStudent.id}&practice_type=${practice}`
          );
        }
        
        setArtifacts(response.data);
      } catch (error) {
        console.error('산출물 조회 오류:', error);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedStudent || artifacts.length < 2) {
      alert('성장 분석을 위해 최소 2개 이상의 산출물이 필요합니다');
      return;
    }

    if (demoMode) {
      // 데모 모드: 가상 분석 결과 표시
      const demoAnalyses = await getGrowthAnalyses(selectedStudent.id);
      if (demoAnalyses.length > 0) {
        setAnalysis(demoAnalyses[0]);
        alert('✅ 성장 분석이 완료되었습니다 (데모 데이터)');
      }
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/growth-analysis`, {
        student_id: selectedStudent.id,
        practice_type: selectedPractice,
        artifact_ids: artifacts.map(a => a.id)
      });

      setAnalysis(response.data.analysis);
      alert('✅ 성장 분석이 완료되었습니다');
    } catch (error) {
      alert('분석 오류: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>📈 성장 분석</h1>

      {students.length === 0 ? (
        <div className="alert alert-warning">학생이 없습니다</div>
      ) : (
        <>
          <div className="grid grid-2">
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

            <div className="form-group">
              <label>실천 활동</label>
              <select value={selectedPractice} onChange={handleSelectPractice}>
                {Object.entries(PRACTICE_TYPES).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedStudent && (
            <>
              <div className="alert alert-info">
                선택된 학생: <strong>{selectedStudent.name}</strong> | 
                산출물: <strong>{artifacts.length}개</strong>
              </div>

              {artifacts.length < 2 ? (
                <div className="alert alert-warning">
                  성장 분석을 위해 최소 2개 이상의 산출물이 필요합니다
                </div>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleAnalyze}
                  disabled={loading}
                >
                  {loading ? '분석 중...' : '📊 성장 분석 실행'}
                </button>
              )}

              {analysis && (
                <div style={{marginTop: '2rem'}}>
                  <h2>분석 결과</h2>
                  <div className="card">
                    <pre style={{
                      backgroundColor: '#f9fafb',
                      padding: '1rem',
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxHeight: '500px'
                    }}>
                      {typeof analysis === 'string' ? analysis : JSON.stringify(analysis, null, 2)}
                    </pre>
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
