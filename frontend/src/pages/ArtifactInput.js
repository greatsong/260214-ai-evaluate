import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { isDemoMode, getArtifacts } from '../services/demoData';

const API_BASE = 'http://localhost:5001/api';
const PRACTICE_TYPES = {
  p1_discomfort: '불편함 수집',
  p2_comparison: 'AI와 비교',
  p3_definition: '문제 정의서',
  p4_ai_log: 'AI 활용 일지',
  p7_reflection: '성장 성찰'
};

export default function ArtifactInput({ students, demoMode }) {
  const [artifacts, setArtifacts] = useState([]);
  const [formData, setFormData] = useState({
    student_id: '',
    practice_type: 'p1_discomfort',
    raw_text: '',
    date: new Date().toISOString().split('T')[0],
    session: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    fetchArtifacts();
  }, [demoMode]);

  const fetchArtifacts = async () => {
    try {
      let response;
      
      if (demoMode) {
        const artifacts = await getArtifacts();
        response = { data: artifacts };
      } else {
        response = await axios.get(`${API_BASE}/artifacts`);
      }
      
      setArtifacts(response.data);
    } catch (error) {
      console.error('산출물 조회 오류:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (demoMode) {
      alert('데모 모드에서는 새 산출물을 추가할 수 없습니다');
      return;
    }

    if (!formData.student_id) {
      alert('학생을 선택하세요');
      return;
    }

    if (!formData.raw_text.trim()) {
      alert('산출물 내용을 입력하세요');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE}/artifacts`, {
        student_id: parseInt(formData.student_id),
        practice_type: formData.practice_type,
        raw_text: formData.raw_text,
        date: formData.date,
        session: formData.session
      });

      alert('✅ 산출물이 저장되었습니다');
      setFormData({
        student_id: '',
        practice_type: 'p1_discomfort',
        raw_text: '',
        date: new Date().toISOString().split('T')[0],
        session: ''
      });
    } catch (error) {
      alert('오류: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>📝 산출물 입력</h1>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          조회
        </button>
        <button 
          className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
          disabled={demoMode}
        >
          입력 {demoMode && '(데모모드)'}
        </button>
      </div>

      {activeTab === 'list' ? (
        // 산출물 조회
        <div className="artifacts-list">
          <h2>등록된 산출물 ({artifacts.length}개)</h2>
          {artifacts.length === 0 ? (
            <div className="alert alert-warning">등록된 산출물이 없습니다</div>
          ) : (
            <div className="grid grid-2">
              {artifacts.map(artifact => {
                const student = students.find(s => s.id === artifact.student_id);
                return (
                  <div key={artifact.id} className="card">
                    <h3>{PRACTICE_TYPES[artifact.practice_type]}</h3>
                    <div className="artifact-meta">
                      <span><strong>학생:</strong> {student?.name || '(삭제됨)'}</span>
                      <span><strong>작성일:</strong> {artifact.date}</span>
                      <span><strong>차시:</strong> {artifact.session || '-'}</span>
                    </div>
                    <p className="artifact-text">{artifact.raw_text.substring(0, 150)}...</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // 산출물 입력
        <>
          {students.length === 0 ? (
            <div className="alert alert-warning">먼저 학생을 등록하세요</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>학생 선택 *</label>
                  <select
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleInputChange}
                  >
                    <option value="">선택하세요</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.student_number ? `${student.student_number} - ${student.name}` : student.name} ({student.class_name} {student.number || ''})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>실천 활동 *</label>
                  <select
                    name="practice_type"
                    value={formData.practice_type}
                    onChange={handleInputChange}
                  >
                    {Object.entries(PRACTICE_TYPES).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>작성일</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>차시</label>
                  <input
                    type="text"
                    name="session"
                    value={formData.session}
                    onChange={handleInputChange}
                    placeholder="예: 6차시"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>산출물 내용 *</label>
                <textarea
                  name="raw_text"
                  value={formData.raw_text}
                  onChange={handleInputChange}
                  placeholder="학생이 작성한 산출물 전체를 붙여넣으세요"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '저장 중...' : '💾 저장'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
