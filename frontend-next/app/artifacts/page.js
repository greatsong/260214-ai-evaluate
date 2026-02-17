'use client';
import { useState, useEffect, useCallback } from 'react';
import { getStudents, getArtifacts, addArtifact, deleteArtifact } from '@/lib/api';
import { PRACTICE_TYPES, TEACHER_OBSERVATION_TYPES } from '@/lib/constants';
import rubrics from '@/lib/rubrics';
import { useToast } from '@/components/Toast';
import { StudentSelector, PracticeTypeSelector } from '@/components/StudentSelector';
import EmptyState from '@/components/EmptyState';

export default function ArtifactsPage() {
  const [students, setStudents] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [form, setForm] = useState({
    student_id: '', practice_type: 'p1_discomfort', raw_text: '',
    date: new Date().toISOString().split('T')[0], session: '',
    observation_scores: {}, teacher_memo: ''
  });

  const isObservationType = TEACHER_OBSERVATION_TYPES.includes(form.practice_type);
  const observationRubric = isObservationType ? rubrics[form.practice_type] : null;
  const [filter, setFilter] = useState({ student_id: '', practice_type: '' });
  const { showSuccess, showError } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [s, a] = await Promise.all([getStudents(), getArtifacts(filter)]);
      setStudents(s);
      setArtifacts(a);
    } catch (e) { showError('데이터 로드 실패'); }
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student_id) { showError('학생을 선택하세요.'); return; }

    if (isObservationType) {
      const items = Object.keys(observationRubric.items);
      const scored = items.filter(k => form.observation_scores[k]);
      if (scored.length < items.length) { showError('모든 항목의 점수를 입력하세요.'); return; }
      // 관찰 기록을 raw_text로 변환
      const lines = items.map(k => {
        const item = observationRubric.items[k];
        const score = form.observation_scores[k];
        return `[${item.name}] ${score}점 — ${item.levels[score]}`;
      });
      if (form.teacher_memo.trim()) lines.push(`\n교사 메모: ${form.teacher_memo}`);
      const raw_text = `[교사 관찰 기록] ${observationRubric.name}\n\n${lines.join('\n')}`;
      try {
        await addArtifact({ student_id: parseInt(form.student_id), practice_type: form.practice_type, date: form.date, session: form.session, raw_text });
        setForm({ ...form, observation_scores: {}, teacher_memo: '', session: '' });
        fetchData();
      } catch (err) { showError('등록 오류: ' + err.message); }
    } else {
      if (!form.raw_text.trim()) { showError('산출물 내용을 입력하세요.'); return; }
      if (form.raw_text.trim().length < 10) { showError('산출물이 너무 짧습니다 (최소 10자).'); return; }
      try {
        await addArtifact({ ...form, student_id: parseInt(form.student_id) });
        setForm({ ...form, raw_text: '', session: '' });
        fetchData();
      } catch (err) { showError('등록 오류: ' + err.message); }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('이 산출물을 삭제하시겠습니까?')) return;
    try { await deleteArtifact(id); fetchData(); } catch (e) { showError(e.message); }
  };

  const getStudentName = (id) => students.find(s => s.id === id)?.name || `#${id}`;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">산출물 입력</h1>

      <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
        <h2 className="font-semibold mb-4">새 산출물 등록</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <StudentSelector students={students} value={form.student_id}
              onChange={v => setForm({...form, student_id: v})}
              label="" placeholder="학생 선택 *" />
            <PracticeTypeSelector value={form.practice_type}
              onChange={v => setForm({...form, practice_type: v})}
              label="" />
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
              className="border rounded px-3 py-2 text-sm" />
            <input placeholder="차시" value={form.session} onChange={e => setForm({...form, session: e.target.value})}
              className="border rounded px-3 py-2 text-sm" />
          </div>
          {isObservationType && observationRubric ? (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-amber-700">교사 관찰 기록 모드</p>
                <p className="text-xs text-amber-600 mt-0.5">{observationRubric.name} — 각 항목을 1~4점으로 평가하세요.</p>
              </div>
              {Object.entries(observationRubric.items).map(([key, item]) => (
                <div key={key} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(n => (
                        <button key={n} type="button"
                          onClick={() => setForm(f => ({ ...f, observation_scores: { ...f.observation_scores, [key]: n } }))}
                          className={`w-8 h-8 rounded text-sm font-bold transition-colors ${
                            form.observation_scores[key] === n
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}>{n}</button>
                      ))}
                    </div>
                  </div>
                  {form.observation_scores[key] && (
                    <p className="text-xs text-blue-600 bg-blue-50 rounded p-2">
                      {item.levels[form.observation_scores[key]]}
                    </p>
                  )}
                </div>
              ))}
              <textarea
                placeholder="교사 메모 (선택)"
                value={form.teacher_memo}
                onChange={e => setForm({...form, teacher_memo: e.target.value})}
                rows={3}
                className="w-full border rounded px-3 py-2 text-sm resize-y"
              />
              <div className="flex justify-end">
                <button type="submit" className="bg-emerald-600 text-white rounded px-6 py-2 text-sm hover:bg-emerald-700">
                  관찰 기록 등록
                </button>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </form>
      </div>

      {/* 필터 */}
      <div className="flex gap-3 mb-4">
        <StudentSelector students={students} value={filter.student_id}
          onChange={v => setFilter({...filter, student_id: v})}
          label="" placeholder="전체 학생" showClass={false} />
        <PracticeTypeSelector value={filter.practice_type}
          onChange={v => setFilter({...filter, practice_type: v})}
          label="" includeAll />
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
              <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-600 text-xs" aria-label="산출물 삭제">삭제</button>
            </div>
            <p className="mt-2 text-sm text-slate-600 line-clamp-3 whitespace-pre-wrap">{a.raw_text}</p>
          </div>
        ))}
        {artifacts.length === 0 && <EmptyState message="산출물이 없습니다" />}
      </div>
    </div>
  );
}
