'use client';
import { useState } from 'react';
import { getArtifacts, getEvaluations } from '@/lib/api';
import { PRACTICE_TYPES } from '@/lib/constants';

export default function MySubmissionsPage() {
  const [studentNumber, setStudentNumber] = useState('');
  const [student, setStudent] = useState(null);
  const [artifacts, setArtifacts] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedArtifact, setSelectedArtifact] = useState(null);

  const handleLookup = async () => {
    if (!studentNumber || studentNumber.length < 3) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/students/lookup?number=${studentNumber}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      setStudent(data);

      const arts = await getArtifacts({ student_id: data.id });
      setArtifacts(arts);

      // 각 산출물의 평가 결과 조회
      const evalMap = {};
      for (const art of arts) {
        try {
          const evals = await getEvaluations({ artifact_id: art.id });
          if (evals.length > 0) {
            const ev = evals[0];
            if (typeof ev.scores === 'string') ev.scores = JSON.parse(ev.scores);
            if (typeof ev.feedback === 'string') {
              try { ev.feedbackObj = JSON.parse(ev.feedback); } catch { ev.feedbackObj = null; }
            }
            evalMap[art.id] = ev;
          }
        } catch { /* skip */ }
      }
      setEvaluations(evalMap);
    } catch (e) {
      setError('조회 중 오류가 발생했습니다.');
    } finally { setLoading(false); }
  };

  const getLevel = (ev) => ev?.level || (ev?.total_score >= 3.5 ? '탁월' : ev?.total_score >= 2.5 ? '우수' : ev?.total_score >= 1.5 ? '보통' : '미달');
  const levelColor = (level) => ({
    '탁월': 'bg-emerald-100 text-emerald-800',
    '우수': 'bg-blue-100 text-blue-800',
    '보통': 'bg-amber-100 text-amber-800',
    '미달': 'bg-red-100 text-red-800',
  }[level] || 'bg-slate-100 text-slate-600');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800">내 제출 이력 & 피드백</h1>
          <div className="flex gap-3 text-xs">
            <a href="/submit" className="text-blue-600 hover:underline">산출물 제출</a>
            <a href="/guide-student" className="text-slate-500 hover:underline">작성 가이드</a>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-6">
        {/* 학번 입력 */}
        {!student ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <h2 className="text-lg font-bold mb-4">학번을 입력하세요</h2>
            <div className="flex gap-3 max-w-sm mx-auto">
              <input
                type="text" value={studentNumber}
                onChange={e => setStudentNumber(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
                placeholder="학번 (예: 10101)"
                className="border rounded-lg px-4 py-2.5 text-sm flex-1 focus:ring-2 focus:ring-blue-300 outline-none"
                autoFocus
              />
              <button onClick={handleLookup} disabled={loading}
                className="bg-blue-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-blue-700 disabled:bg-slate-300">
                {loading ? '조회 중...' : '조회'}
              </button>
            </div>
            {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
          </div>
        ) : (
          <>
            {/* 학생 정보 */}
            <div className="bg-white rounded-xl border p-4 mb-6 flex items-center justify-between">
              <div>
                <span className="font-bold text-lg">{student.name}</span>
                <span className="text-sm text-slate-500 ml-3">{student.class_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">제출 {artifacts.length}건</span>
                <button onClick={() => { setStudent(null); setArtifacts([]); setEvaluations({}); setSelectedArtifact(null); }}
                  className="text-xs text-slate-400 hover:text-slate-600">다른 학생</button>
              </div>
            </div>

            {artifacts.length === 0 ? (
              <div className="bg-white rounded-xl border p-8 text-center text-slate-400">
                <p className="mb-3">아직 제출한 산출물이 없습니다.</p>
                <a href="/submit" className="text-blue-600 hover:underline text-sm">산출물 제출하러 가기</a>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {/* 산출물 목록 */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-500 mb-2">산출물 목록</h3>
                  {artifacts.map(a => {
                    const ev = evaluations[a.id];
                    return (
                      <div key={a.id}
                        onClick={() => setSelectedArtifact(a)}
                        className={`p-3 rounded-lg cursor-pointer text-sm transition-colors border ${
                          selectedArtifact?.id === a.id
                            ? 'bg-blue-50 border-blue-400'
                            : 'bg-white border-slate-200 hover:border-blue-300'
                        }`}>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-xs">{PRACTICE_TYPES[a.practice_type]}</span>
                          {ev && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${levelColor(getLevel(ev))}`}>
                              {getLevel(ev)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{a.date}</div>
                      </div>
                    );
                  })}
                </div>

                {/* 상세 보기 */}
                <div className="col-span-2">
                  {!selectedArtifact ? (
                    <div className="bg-white rounded-xl border p-8 text-center text-slate-400 text-sm">
                      왼쪽에서 산출물을 선택하세요.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* 원문 */}
                      <div className="bg-white rounded-xl border p-4">
                        <h4 className="text-sm font-semibold mb-2">내 산출물</h4>
                        <div className="bg-slate-50 rounded-lg p-3 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                          {selectedArtifact.raw_text}
                        </div>
                        <div className="text-xs text-slate-400 mt-2">
                          {selectedArtifact.date} {selectedArtifact.session && `| ${selectedArtifact.session}`} | {selectedArtifact.raw_text.length}자
                        </div>
                      </div>

                      {/* 평가 결과 */}
                      {evaluations[selectedArtifact.id] ? (
                        <div className="space-y-4">
                          {(() => {
                            const ev = evaluations[selectedArtifact.id];
                            const scores = ev.item_scores || ev.scores;
                            return (
                              <>
                                <div className="bg-white rounded-xl border p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-xs text-slate-500">총점</p>
                                      <p className="text-2xl font-bold text-blue-700">
                                        {ev.total_score?.toFixed(2)} <span className="text-sm font-normal text-slate-400">/ 4.0</span>
                                      </p>
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${levelColor(getLevel(ev))}`}>
                                      {getLevel(ev)}
                                    </span>
                                  </div>
                                </div>

                                {/* 항목별 점수 */}
                                {scores && (
                                  <div className="bg-white rounded-xl border p-4">
                                    <h4 className="text-sm font-semibold mb-3">항목별 점수</h4>
                                    <div className="space-y-2">
                                      {Object.entries(scores).map(([key, val]) => {
                                        const score = typeof val === 'object' ? val.score : val;
                                        const feedback = typeof val === 'object' ? val.feedback : '';
                                        return (
                                          <div key={key} className="border rounded-lg p-3">
                                            <div className="flex justify-between items-center mb-1">
                                              <span className="text-xs font-medium">{key}</span>
                                              <div className="flex gap-1">
                                                {[1, 2, 3, 4].map(n => (
                                                  <div key={n} className={`w-5 h-5 rounded text-xs flex items-center justify-center font-bold ${
                                                    n <= score ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-300'
                                                  }`}>{n}</div>
                                                ))}
                                              </div>
                                            </div>
                                            {feedback && <p className="text-xs text-slate-600 mt-1">{feedback}</p>}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* 피드백 */}
                                <div className="bg-white rounded-xl border p-4 space-y-3">
                                  <h4 className="text-sm font-semibold">AI 피드백</h4>
                                  {(ev.praise || ev.feedbackObj?.praise) && (
                                    <div className="bg-emerald-50 rounded-lg p-3">
                                      <p className="text-xs font-semibold text-emerald-700 mb-1">잘한 점</p>
                                      <p className="text-sm text-emerald-800">{ev.praise || ev.feedbackObj?.praise}</p>
                                    </div>
                                  )}
                                  {(ev.improvement || ev.feedbackObj?.improvement) && (
                                    <div className="bg-amber-50 rounded-lg p-3">
                                      <p className="text-xs font-semibold text-amber-700 mb-1">개선할 점</p>
                                      <p className="text-sm text-amber-800">{ev.improvement || ev.feedbackObj?.improvement}</p>
                                    </div>
                                  )}
                                  {(ev.action_guide || ev.feedbackObj?.action_guide) && (
                                    <div className="bg-blue-50 rounded-lg p-3">
                                      <p className="text-xs font-semibold text-blue-700 mb-1">다음에 이렇게 해보세요</p>
                                      <p className="text-sm text-blue-800">{ev.action_guide || ev.feedbackObj?.action_guide}</p>
                                    </div>
                                  )}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-xl border border-dashed p-6 text-center text-sm text-slate-400">
                          아직 평가되지 않았습니다. 선생님이 평가를 진행하면 여기에서 확인할 수 있어요.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
