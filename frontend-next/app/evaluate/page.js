'use client';
import { useState, useEffect, useCallback } from 'react';
import { getStudents, getArtifacts, getEvaluations, evaluateArtifact, getRubrics } from '@/lib/api';
import { PRACTICE_TYPES } from '@/lib/constants';
import { ScoreRadarChart } from '@/components/Charts';
import ScoreTable from '@/components/ScoreTable';
import FeedbackCard from '@/components/FeedbackCard';
import LevelBadge from '@/components/LevelBadge';

export default function EvaluatePage() {
  const [students, setStudents] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [rubrics, setRubrics] = useState({});
  const [filter, setFilter] = useState({ student_id: '', practice_type: '' });
  const [selected, setSelected] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [s, a, r] = await Promise.all([getStudents(), getArtifacts(filter), getRubrics()]);
      setStudents(s);
      setArtifacts(a.reverse());
      setRubrics(r);
    } catch (e) { console.error(e); }
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSelect = async (artifact) => {
    setSelected(artifact);
    setEvaluation(null);
    try {
      const evals = await getEvaluations({ artifact_id: artifact.id });
      if (evals.length > 0) {
        const ev = evals[0];
        // scores가 문자열이면 파싱
        if (typeof ev.scores === 'string') ev.scores = JSON.parse(ev.scores);
        if (typeof ev.feedback === 'string') {
          try { ev.feedbackObj = JSON.parse(ev.feedback); } catch { ev.feedbackObj = null; }
        }
        setEvaluation(ev);
      }
    } catch (e) { console.error(e); }
  };

  const handleEvaluate = async () => {
    if (!selected) return;
    const student = students.find(s => s.id === selected.student_id);
    try {
      setEvaluating(true);
      const result = await evaluateArtifact({
        artifact_id: selected.id,
        practice_type: selected.practice_type,
        raw_text: selected.raw_text,
        student_name: student?.name
      });
      setEvaluation(result);
    } catch (e) {
      alert('평가 오류: ' + (e.response?.data?.error || e.message));
    } finally {
      setEvaluating(false);
    }
  };

  const getStudentName = (id) => students.find(s => s.id === id)?.name || `#${id}`;
  const currentRubric = selected ? rubrics[selected.practice_type] : null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">개별 평가</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* 좌측: 산출물 목록 */}
        <div>
          <div className="flex gap-2 mb-3">
            <select value={filter.student_id} onChange={e => setFilter({...filter, student_id: e.target.value})}
              className="border rounded px-2 py-1.5 text-xs bg-white flex-1">
              <option value="">전체 학생</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={filter.practice_type} onChange={e => setFilter({...filter, practice_type: e.target.value})}
              className="border rounded px-2 py-1.5 text-xs bg-white flex-1">
              <option value="">전체</option>
              {Object.entries(PRACTICE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {artifacts.map(a => (
              <div key={a.id} onClick={() => handleSelect(a)}
                className={`p-3 rounded-lg cursor-pointer text-sm transition-colors ${
                  selected?.id === a.id ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white border border-slate-200 hover:border-blue-300'
                }`}>
                <div className="font-medium">{getStudentName(a.student_id)}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {PRACTICE_TYPES[a.practice_type]} · {a.date}
                </div>
              </div>
            ))}
            {artifacts.length === 0 && <p className="text-sm text-slate-400 text-center py-4">산출물 없음</p>}
          </div>
        </div>

        {/* 우측: 평가 영역 */}
        <div className="col-span-2">
          {!selected ? (
            <div className="bg-white rounded-lg p-8 text-center text-slate-400">
              왼쪽에서 산출물을 선택하세요
            </div>
          ) : (
            <div className="space-y-4">
              {/* 산출물 원문 */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-sm">산출물 원문</h3>
                  <span className="text-xs bg-slate-100 rounded px-2 py-0.5">
                    {PRACTICE_TYPES[selected.practice_type]}
                  </span>
                </div>
                <div className="bg-slate-50 rounded p-3 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selected.raw_text}
                </div>
              </div>

              {/* 평가 버튼 or 결과 */}
              {!evaluation ? (
                <button onClick={handleEvaluate} disabled={evaluating}
                  className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-300">
                  {evaluating ? '평가 중... (AI 분석 대기)' : 'AI 평가 수행'}
                </button>
              ) : (
                <div className="space-y-4">
                  {/* 총점 + 수준 */}
                  <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">총점</p>
                        <p className="text-3xl font-bold text-blue-700">
                          {evaluation.total_score?.toFixed(2)} <span className="text-lg font-normal text-slate-400">/ 4.0</span>
                        </p>
                        {evaluation.sum_score !== undefined && (
                          <p className="text-xs text-slate-400 mt-1">
                            합계: {evaluation.sum_score} / {evaluation.max_score}
                          </p>
                        )}
                      </div>
                      <LevelBadge level={evaluation.level} />
                    </div>
                  </div>

                  {/* 레이더 차트 */}
                  <div className="bg-white rounded-lg shadow-sm p-5">
                    <h3 className="font-semibold text-sm mb-3">항목별 점수</h3>
                    <ScoreRadarChart scores={evaluation.item_scores || evaluation.scores} rubricItems={currentRubric?.items} />
                  </div>

                  {/* 점수 테이블 */}
                  <div className="bg-white rounded-lg shadow-sm p-5">
                    <h3 className="font-semibold text-sm mb-3">상세 평가</h3>
                    <ScoreTable scores={evaluation.item_scores || evaluation.scores} rubricItems={currentRubric?.items} />
                  </div>

                  {/* 피드백 카드 */}
                  <div>
                    <h3 className="font-semibold text-sm mb-3">피드백</h3>
                    <FeedbackCard
                      praise={evaluation.praise || evaluation.feedbackObj?.praise}
                      improvement={evaluation.improvement || evaluation.feedbackObj?.improvement}
                      actionGuide={evaluation.action_guide || evaluation.feedbackObj?.action_guide}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
