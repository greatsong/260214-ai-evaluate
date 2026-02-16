'use client';
import { useState, useEffect, useCallback } from 'react';
import { getStudents, getArtifacts, addArtifact, deleteArtifact } from '@/lib/api';
import { PRACTICE_TYPES } from '@/lib/constants';

export default function ArtifactsPage() {
  const [students, setStudents] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [form, setForm] = useState({
    student_id: '', practice_type: 'p1_discomfort', raw_text: '',
    date: new Date().toISOString().split('T')[0], session: ''
  });
  const [filter, setFilter] = useState({ student_id: '', practice_type: '' });

  const fetchData = useCallback(async () => {
    try {
      const [s, a] = await Promise.all([getStudents(), getArtifacts(filter)]);
      setStudents(s);
      setArtifacts(a);
    } catch (e) { console.error(e); }
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student_id || !form.raw_text.trim()) return alert('학생과 산출물 내용을 입력하세요.');
    if (form.raw_text.trim().length < 10) return alert('산출물이 너무 짧습니다 (최소 10자).');
    try {
      await addArtifact({ ...form, student_id: parseInt(form.student_id) });
      setForm({ ...form, raw_text: '', session: '' });
      fetchData();
    } catch (err) { alert('등록 오류: ' + err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('이 산출물을 삭제하시겠습니까?')) return;
    try { await deleteArtifact(id); fetchData(); } catch (e) { alert(e.message); }
  };

  const getStudentName = (id) => students.find(s => s.id === id)?.name || `#${id}`;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">산출물 입력</h1>

      <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
        <h2 className="font-semibold mb-4">새 산출물 등록</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <select value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})}
              className="border rounded px-3 py-2 text-sm">
              <option value="">학생 선택 *</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class_name})</option>)}
            </select>
            <select value={form.practice_type} onChange={e => setForm({...form, practice_type: e.target.value})}
              className="border rounded px-3 py-2 text-sm">
              {Object.entries(PRACTICE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
              className="border rounded px-3 py-2 text-sm" />
            <input placeholder="차시" value={form.session} onChange={e => setForm({...form, session: e.target.value})}
              className="border rounded px-3 py-2 text-sm" />
          </div>
          <textarea
            placeholder="학생 산출물 내용을 입력하세요... (최소 10자)"
            value={form.raw_text}
            onChange={e => setForm({...form, raw_text: e.target.value})}
            rows={8}
            className="w-full border rounded px-3 py-2 text-sm resize-y"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">{form.raw_text.length}자</span>
            <button type="submit" className="bg-emerald-600 text-white rounded px-6 py-2 text-sm hover:bg-emerald-700">
              등록
            </button>
          </div>
        </form>
      </div>

      {/* 필터 */}
      <div className="flex gap-3 mb-4">
        <select value={filter.student_id} onChange={e => setFilter({...filter, student_id: e.target.value})}
          className="border rounded px-3 py-2 text-sm bg-white">
          <option value="">전체 학생</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filter.practice_type} onChange={e => setFilter({...filter, practice_type: e.target.value})}
          className="border rounded px-3 py-2 text-sm bg-white">
          <option value="">전체 유형</option>
          {Object.entries(PRACTICE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* 목록 */}
      <div className="space-y-3">
        {artifacts.map(a => (
          <div key={a.id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5 mr-2">
                  {PRACTICE_TYPES[a.practice_type] || a.practice_type}
                </span>
                <span className="text-sm font-medium">{getStudentName(a.student_id)}</span>
                <span className="text-xs text-slate-400 ml-2">{a.date}</span>
              </div>
              <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-600 text-xs">삭제</button>
            </div>
            <p className="mt-2 text-sm text-slate-600 line-clamp-3 whitespace-pre-wrap">{a.raw_text}</p>
          </div>
        ))}
        {artifacts.length === 0 && (
          <div className="text-center py-8 text-slate-400">산출물이 없습니다</div>
        )}
      </div>
    </div>
  );
}
