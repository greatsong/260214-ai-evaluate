import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { isDemoMode, getArtifacts, getEvaluations } from '../services/demoData';

const API_BASE = 'http://localhost:5001/api';
const PRACTICE_TYPES = {
  p1_discomfort: '불편함 수집',
  p2_comparison: 'AI와 비교',
  p3_definition: '문제 정의서',
  p4_ai_log: 'AI 활용 일지',
  p7_reflection: '성장 성찰'
};

export default function IndividualEvaluation({ demoMode }) {
  const [artifacts, setArtifacts] = useState([]);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    fetchArtifacts();
  }, [demoMode]);

  const fetchArtifacts = async () => {
    try {
      setLoading(true);
      let response;
      
      if (demoMode) {
        const artifacts = await getArtifacts();
        response = { data: artifacts.reverse() };
      } else {
        response = await axios.get(`${API_BASE}/artifacts`);
        response.data = response.data.reverse();
      }
      
      setArtifacts(response.data);
    } catch (error) {
      console.error('산출물 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectArtifact = async (artifact) => {
    setSelectedArtifact(artifact);
    
    try {
      // 기존 평가 확인
      let response;
      
      if (demoMode) {
        const evaluations = await getEvaluations(artifact.id);
        response = { data: evaluations };
      } else {
        response = await axios.get(
          `${API_BASE}/evaluations?artifact_id=${artifact.id}`
        );
      }
      
      if (response.data.length > 0) {
        setEvaluation(response.data[0]);
      } else {
        setEvaluation(null);
      }
    } catch (error) {
      console.error('평가 조회 오류:', error);
    }
  };

  const handleEvaluate = async () => {
    if (!selectedArtifact) return;

    if (demoMode) {
      alert('데모 모드에서는 AI 평가를 실행할 수 없습니다. OFF 모드에서 실행하세요.');
      return;
    }

    try {
      setEvaluating(true);
      const response = await axios.post(`${API_BASE}/evaluate`, {
        artifact_id: selectedArtifact.id,
        practice_type: selectedArtifact.practice_type,
        raw_text: selectedArtifact.raw_text
      });

      setEvaluation(response.data);
      alert('✅ 평가가 완료되었습니다');
    } catch (error) {
      alert('평가 오류: ' + error.message);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="container">
      <h1>⭐ 개별 평가</h1>

      <div className="grid grid-2">
        <div>
          <h2>산출물 선택</h2>
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              로드 중...
            </div>
          ) : artifacts.length === 0 ? (
            <div className="alert alert-info">평가할 산출물이 없습니다</div>
          ) : (
            <div style={{maxHeight: '500px', overflowY: 'auto'}}>
              {artifacts.map(artifact => (
                <div
                  key={artifact.id}
                  onClick={() => handleSelectArtifact(artifact)}
                  style={{
                    padding: '1rem',
                    margin: '0.5rem 0',
                    border: selectedArtifact?.id === artifact.id ? '2px solid #1e40af' : '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: selectedArtifact?.id === artifact.id ? '#f0f9ff' : 'white'
                  }}
                >
                  <div style={{fontWeight: 'bold'}}>{PRACTICE_TYPES[artifact.practice_type]}</div>
                  <div style={{fontSize: '0.875rem', color: '#666'}}>ID: {artifact.id} | {artifact.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {selectedArtifact ? (
            <>
              <h2>산출물 내용</h2>
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '1rem',
                borderRadius: '4px',
                maxHeight: '300px',
                overflowY: 'auto',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {selectedArtifact.raw_text}
              </div>

              {evaluation ? (
                <div className="alert alert-success">
                  ✅ 이 산출물은 이미 평가되었습니다
                </div>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleEvaluate}
                  disabled={evaluating}
                >
                  {evaluating ? '평가 중...' : '🤖 AI 평가 수행'}
                </button>
              )}
            </>
          ) : (
            <div className="alert alert-info">왼쪽에서 산출물을 선택하세요</div>
          )}
        </div>
      </div>

      {evaluation && (
        <div style={{marginTop: '2rem'}}>
          <h2>평가 결과</h2>
          
          <div style={{
            backgroundColor: '#f0f9ff',
            padding: '1.5rem',
            borderRadius: '4px',
            border: '2px solid #0ea5e9',
            marginBottom: '1.5rem'
          }}>
            <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#0369a1'}}>
              총점: {evaluation.total_score?.toFixed(2) || 'N/A'} / 4.0
            </div>
          </div>

          {evaluation.scores && Object.entries(evaluation.scores).map(([item, score]) => (
            <div key={item} className="card" style={{marginBottom: '1rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3>{item}</h3>
                <div style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#1e40af'}}>
                  {score.toFixed(2)}점
                </div>
              </div>
            </div>
          ))}

          {evaluation.feedback && (
            <div className="card">
              <h3>평가 피드백</h3>
              <p>{evaluation.feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
