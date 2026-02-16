import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// 페이지 컴포넌트들 import
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import ArtifactInput from './pages/ArtifactInput';
import IndividualEvaluation from './pages/IndividualEvaluation';
import GrowthAnalysis from './pages/GrowthAnalysis';
import Portfolio from './pages/Portfolio';
import ClassStatus from './pages/ClassStatus';

// 데모 데이터 import
import { isDemoMode, setDemoMode, getStudents as getDemoStudents } from './services/demoData';

const API_BASE = 'http://localhost:5001/api';

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoModeState] = useState(isDemoMode());

  useEffect(() => {
    fetchStudents();
  }, [demoMode]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let response;
      
      if (demoMode) {
        // 데모 모드: 가상 데이터 사용
        const demoStudents = await getDemoStudents();
        response = { data: demoStudents };
      } else {
        // 실제 API 호출
        response = await axios.get(`${API_BASE}/students`);
      }
      
      setStudents(response.data);
    } catch (error) {
      console.error('학생 데이터 조회 오류:', error);
      // API 실패 시 자동으로 데모 모드 활성화
      if (!demoMode) {
        console.log('API 호출 실패. 데모 모드로 전환합니다.');
        setDemoMode(true);
        setDemoModeState(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleDemoMode = () => {
    const newMode = !demoMode;
    setDemoMode(newMode);
    setDemoModeState(newMode);
  };

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-container">
            <Link to="/" className="navbar-brand">
              🎓 AI 교실 실천 평가 시스템
            </Link>
            <ul className="navbar-menu">
              <li><Link to="/">홈</Link></li>
              <li><Link to="/students">학생 관리</Link></li>
              <li><Link to="/artifacts">산출물 입력</Link></li>
              <li><Link to="/evaluation">개별 평가</Link></li>
              <li><Link to="/growth">성장 분석</Link></li>
              <li><Link to="/portfolio">포트폴리오</Link></li>
              <li><Link to="/status">학급 현황</Link></li>
              <li>
                <button 
                  className={`demo-toggle ${demoMode ? 'active' : ''}`}
                  onClick={toggleDemoMode}
                  title={demoMode ? '데모 모드 OFF' : '데모 모드 ON'}
                >
                  {demoMode ? '🎬 데모 ON' : '🎬 데모 OFF'}
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          {demoMode && (
            <div className="demo-banner">
              ⚡ 데모 모드 활성화됨 - 가상 데이터로 시연 중입니다
            </div>
          )}
          <Routes>
            <Route path="/" element={<Dashboard students={students} demoMode={demoMode} />} />
            <Route path="/students" element={<StudentManagement onRefresh={fetchStudents} demoMode={demoMode} />} />
            <Route path="/artifacts" element={<ArtifactInput students={students} demoMode={demoMode} />} />
            <Route path="/evaluation" element={<IndividualEvaluation demoMode={demoMode} />} />
            <Route path="/growth" element={<GrowthAnalysis students={students} demoMode={demoMode} />} />
            <Route path="/portfolio" element={<Portfolio students={students} demoMode={demoMode} />} />
            <Route path="/status" element={<ClassStatus students={students} demoMode={demoMode} />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>AI 시대 교실 실천 평가 시스템 v1.0 | 고등학교 AI/정보 교과용</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
