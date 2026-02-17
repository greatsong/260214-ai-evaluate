'use client';
import { useState, useEffect, useCallback } from 'react';
import { getStudents, addStudent, deleteStudent, importStudentsExcel } from '@/lib/api';
import { useToast } from '@/components/Toast';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ student_number: '', name: '', class_name: '', number: '' });
  const [tab, setTab] = useState('list');
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const fetchStudents = useCallback(async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (e) { showError('학생 목록 로드 실패'); }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.student_number || !form.name) { showError('학번과 이름은 필수입니다.'); return; }
    try {
      await addStudent({ ...form, number: parseInt(form.number) || 0 });
      setForm({ student_number: '', name: '', class_name: '', number: '' });
      fetchStudents();
    } catch (err) { showError('등록 오류: ' + err.message); }
  };

  const handleResetPin = async (id, name) => {
    if (!confirm(`${name} 학생의 비밀번호를 초기화하시겠습니까?\n학생이 다음 접속 시 새 비밀번호를 설정하게 됩니다.`)) return;
    try {
      await fetch('/api/students/reset-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: id }),
      });
      showSuccess(`${name} 학생의 비밀번호가 초기화되었습니다.`);
    } catch (e) { showError('초기화 실패: ' + e.message); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`${name} 학생을 삭제하시겠습니까?`)) return;
    try { await deleteStudent(id); fetchStudents(); } catch (e) { showError(e.message); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result.split(',')[1];
        const result = await importStudentsExcel(base64, file.name);
        setImportResult(result);
        fetchStudents();
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (e) { showError(e.message); setLoading(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">학생 관리</h1>

      {/* 등록 폼 */}
      <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
        <h2 className="font-semibold mb-4">학생 등록</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-5 gap-3">
          <input placeholder="학번 *" value={form.student_number} aria-label="학번"
            onChange={e => setForm({...form, student_number: e.target.value})}
            className="border rounded px-3 py-2 text-sm" />
          <input placeholder="이름 *" value={form.name} aria-label="이름"
            onChange={e => setForm({...form, name: e.target.value})}
            className="border rounded px-3 py-2 text-sm" />
          <input placeholder="반" value={form.class_name} aria-label="반"
            onChange={e => setForm({...form, class_name: e.target.value})}
            className="border rounded px-3 py-2 text-sm" />
          <input placeholder="번호" type="number" value={form.number} aria-label="번호"
            onChange={e => setForm({...form, number: e.target.value})}
            className="border rounded px-3 py-2 text-sm" />
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 text-sm hover:bg-blue-700">
            등록
          </button>
        </form>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('list')}
          className={`px-4 py-2 text-sm rounded ${tab === 'list' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
          학생 목록 ({students.length})
        </button>
        <button onClick={() => setTab('import')}
          className={`px-4 py-2 text-sm rounded ${tab === 'import' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
          엑셀 일괄 등록
        </button>
      </div>

      {tab === 'list' ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left p-3">학번</th>
                <th className="text-left p-3">이름</th>
                <th className="text-left p-3">반</th>
                <th className="text-left p-3">번호</th>
                <th className="text-center p-3">비밀번호</th>
                <th className="text-center p-3">삭제</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-t hover:bg-slate-50">
                  <td className="p-3">{s.student_number}</td>
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3">{s.class_name}</td>
                  <td className="p-3">{s.number}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleResetPin(s.id, s.name)}
                      className="text-amber-600 hover:text-amber-800 text-xs" aria-label="비밀번호 초기화">초기화</button>
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleDelete(s.id, s.name)}
                      className="text-red-500 hover:text-red-700 text-xs" aria-label="학생 삭제">삭제</button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan="6" className="p-6 text-center text-slate-400">등록된 학생이 없습니다</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="font-semibold mb-3">엑셀 파일 업로드</h2>
          <p className="text-sm text-slate-500 mb-4">
            엑셀 파일의 헤더: 학번, 이름, 반, 번호 (또는 student_number, name, class_name, number)
          </p>
          <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload}
            className="block text-sm border rounded p-2" />
          {loading && <p className="mt-3 text-blue-600 text-sm">업로드 중...</p>}
          {importResult && (
            <div className="mt-4 p-4 bg-slate-50 rounded text-sm">
              <p>전체: {importResult.total}명 | 성공: {importResult.successCount}명 | 실패: {importResult.failureCount}명</p>
              {importResult.results?.failed?.length > 0 && (
                <ul className="mt-2 text-red-600">
                  {importResult.results.failed.map((f, i) => (
                    <li key={i}>행 {f.rowNum}: {f.reason}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
