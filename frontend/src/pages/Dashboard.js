import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { isDemoMode, getArtifacts, getEvaluations } from '../services/demoData';

const API_BASE = 'http://localhost:5001/api';

export default function Dashboard({ students, demoMode }) {
  const [stats, setStats] = useState({
    students: 0,
    artifacts: 0,
    evaluations: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [students, demoMode]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      let artifactsData, evaluationsData;
      
      if (demoMode) {
        const [artifacts, evaluations] = await Promise.all([
          getArtifacts(),
          getEvaluations()
        ]);
        artifactsData = artifacts;
        evaluationsData = evaluations;
      } else {
        const [artifactsRes, evaluationsRes] = await Promise.all([
          axios.get(`${API_BASE}/artifacts`),
          axios.get(`${API_BASE}/evaluations`)
        ]);
        artifactsData = artifactsRes.data;
        evaluationsData = evaluationsRes.data;
      }
      
      setStats({
        students: students.length,
        artifacts: artifactsData.length,
        evaluations: evaluationsData.length
      });
    } catch (error) {
      console.error('통계 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🎓 AI 기반 프로젝트 평가 시스템</h1>
      
      <div className="grid grid-3">
        <div className="metric">
          <div className="metric-label">등록된 학생</div>
          <div className="metric-value">{stats.students}</div>
        </div>
        <div className="metric">
          <div className="metric-label">입력된 산출물</div>
          <div className="metric-value">{stats.artifacts}</div>
        </div>
        <div className="metric">
          <div className="metric-label">완료된 평가</div>
          <div className="metric-value">{stats.evaluations}</div>
        </div>
      </div>

      <h2>📚 시스템 소개</h2>
      <p>이 시스템은 고등학교 AI/정보 수업의 <strong>7가지 실천 활동</strong>을 AI가 평가하고 분석하는 플랫폼입니다.</p>

      <h3>실천 활동</h3>
      <ul>
        <li><strong>불편함 수집</strong> - 일상의 불편함을 발견하고 정리</li>
        <li><strong>AI와 비교</strong> - 학생의 방식 vs AI의 방식 비교 분석</li>
        <li><strong>문제 정의서</strong> - 해결할 문제를 명확히 정의</li>
        <li><strong>AI 활용 일지</strong> - AI를 활용하는 과정과 성찰 기록</li>
        <li><strong>구술 면접</strong> - 프로젝트에 대한 3분 면접</li>
        <li><strong>공유 실패 루틴</strong> - 실패 경험 공유</li>
        <li><strong>성장 성찰</strong> - 전체 학습 과정을 성찰</li>
      </ul>

      <h3>이 시스템의 특징</h3>
      <ul>
        <li>🤖 <strong>Claude AI 기반 평가</strong> - 일관되고 객관적인 평가</li>
        <li>📈 <strong>성장 추적</strong> - 시간에 따른 학생의 발전 과정 분석</li>
        <li>🎯 <strong>루브릭 기반</strong> - 명확한 평가 기준</li>
        <li>💭 <strong>비판적 피드백</strong> - AI 결과의 한계와 개선 방향 제시</li>
      </ul>

      <div className="alert alert-info">
        <strong>시작하기:</strong>
        <ol style={{marginTop: '0.5rem'}}>
          <li>좌측 메뉴에서 "학생 관리"로 학생을 등록하세요</li>
          <li>"산출물 입력"에서 학생의 작업물을 입력하세요</li>
          <li>"개별 평가"로 AI 평가를 받으세요</li>
          <li>"성장 분석"으로 학생의 발전 과정을 추적하세요</li>
        </ol>
      </div>
    </div>
  );
}
