import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { isDemoMode, getStudents as getDemoStudents } from '../services/demoData';

const API_BASE = 'http://localhost:5001/api';

export default function StudentManagement({ onRefresh, demoMode }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    student_number: '',
    name: '',
    class_name: '',
    number: ''
  });

  useEffect(() => {
    fetchStudents();
  }, [demoMode]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let response;
      
      if (demoMode) {
        const demoStudents = await getDemoStudents();
        response = { data: demoStudents };
      } else {
        response = await axios.get(`${API_BASE}/students`);
      }
      
      setStudents(response.data);
    } catch (error) {
      console.error('학생 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    if (demoMode) {
      alert('데모 모드에서는 새 학생을 추가할 수 없습니다');
      return;
    }
    
    if (!formData.student_number) {
      alert('학번을 입력하세요');
      return;
    }
    
    if (!formData.name) {
      alert('학생 이름을 입력하세요');
      return;
    }

    try {
      await axios.post(`${API_BASE}/students`, {
        student_number: formData.student_number,
        name: formData.name,
        class_name: formData.class_name,
        number: parseInt(formData.number) || 0
      });
      
      alert('✅ 학생이 추가되었습니다');
      setFormData({ student_number: '', name: '', class_name: '', number: '' });
      fetchStudents();
      onRefresh();
      setActiveTab('list');
    } catch (error) {
      alert('오류: ' + error.message);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('정말로 삭제하시겠습니까?')) {
      try {
        await axios.delete(`${API_BASE}/students/${id}`);
        alert('✅ 학생이 삭제되었습니다');
        fetchStudents();
        onRefresh();
      } catch (error) {
        alert('오류: ' + error.message);
      }
    }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (demoMode) {
      alert('데모 모드에서는 엑셀 업로드를 사용할 수 없습니다');
      return;
    }

    try {
      setUploading(true);
      
      // 파일을 Base64로 변환
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const fileData = evt.target.result.split(',')[1]; // Base64 데이터만 추출
        
        const response = await axios.post(`${API_BASE}/students/import/excel`, {
          fileData,
          fileName: file.name
        });
        
        const { total, successCount, failureCount, results } = response.data;
        
        let message = `업로드 결과:\n총 ${total}명\n성공: ${successCount}명`;
        if (failureCount > 0) {
          message += `\n실패: ${failureCount}명`;
          if (results.failed.length > 0) {
            message += '\n\n실패 사유:';
            results.failed.slice(0, 5).forEach(fail => {
              message += `\n행 ${fail.rowNum}: ${fail.reason}`;
            });
          }
        }
        
        alert(message);
        fetchStudents();
        onRefresh();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert('오류: ' + error.response?.data?.error || error.message);
    } finally {
      setUploading(false);
      e.target.value = ''; // 파일 입력 초기화
    }
  };

  return (
    <div className="container">
      <h1>👥 학생 관리</h1>

      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          학생 목록
        </button>
        <button 
          className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          학생 추가
        </button>
        <button 
          className={`tab-button ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          📊 엑셀 업로드
        </button>
      </div>

      {activeTab === 'list' && (
        <div className="tab-content active">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              로드 중...
            </div>
          ) : students.length === 0 ? (
            <div className="alert alert-info">등록된 학생이 없습니다</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>학번</th>
                    <th>이름</th>
                    <th>반</th>
                    <th>번호</th>
                    <th>등록일</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td>{student.student_number || '-'}</td>
                      <td>{student.name}</td>
                      <td>{student.class_name || '-'}</td>
                      <td>{student.number || '-'}</td>
                      <td>{new Date(student.created_at).toLocaleDateString('ko-KR')}</td>
                      <td>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          🗑️ 삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'add' && (
        <div className="tab-content active">
          <form onSubmit={handleAddStudent}>
            <div className="form-group">
              <label>학번 *</label>
              <input
                type="text"
                name="student_number"
                value={formData.student_number}
                onChange={handleInputChange}
                placeholder="예: 001, 2024001"
              />
            </div>

            <div className="form-group">
              <label>학생 이름 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="이름 입력"
              />
            </div>

            <div className="form-group">
              <label>반</label>
              <input
                type="text"
                name="class_name"
                value={formData.class_name}
                onChange={handleInputChange}
                placeholder="예: 1반"
              />
            </div>

            <div className="form-group">
              <label>번호</label>
              <input
                type="number"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                min="1"
                max="50"
                placeholder="번호"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              ➕ 학생 추가
            </button>
          </form>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="tab-content active">
          <div style={{ maxWidth: '500px' }}>
            <h2>엑셀 파일로 학생 일괄 등록</h2>
            
            <div className="alert alert-info" style={{ marginBottom: '2rem' }}>
              <strong>📋 엑셀 형식:</strong><br/>
              다음 컬럼을 포함한 엑셀 파일을 준비하세요:
              <ul style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                <li><strong>학번</strong> (필수) - 예: 001, 2024001</li>
                <li><strong>이름</strong> (필수) - 학생 이름</li>
                <li><strong>반</strong> (선택) - 예: 1반</li>
                <li><strong>번호</strong> (선택) - 예: 1, 2, 3</li>
              </ul>
            </div>

            <div className="form-group">
              <label>엑셀 파일 선택 *</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                disabled={uploading}
                style={{ padding: '0.5rem' }}
              />
            </div>

            {uploading && (
              <div className="loading">
                <div className="spinner"></div>
                업로드 중...
              </div>
            )}

            <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
              💡 팁: 첫 번째 행은 헤더로 처리되므로 두 번째 행부터 데이터를 입력하세요
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
