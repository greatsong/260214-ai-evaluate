'use client';
import { useState } from 'react';
import { getArtifacts, getEvaluations, getReflection, saveReflection } from '@/lib/api';
import { PRACTICE_TYPES } from '@/lib/constants';

export default function MySubmissionsPage() {
  const [studentNumber, setStudentNumber] = useState('');
  const [pin, setPin] = useState('');
  const [student, setStudent] = useState(null);
  const [artifacts, setArtifacts] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [reflection, setReflection] = useState(null);
  const [reflectionForm, setReflectionForm] = useState({ agree: '', disagree: '', next_time: '' });
  const [showReflectionForm, setShowReflectionForm] = useState(false);
  const [savingReflection, setSavingReflection] = useState(false);

  const handleLookup = async () => {
    if (!studentNumber || studentNumber.length < 3) return;
    if (!pin || pin.length < 4) { setError('비밀번호 4자리를 입력하세요.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/students/lookup?number=${studentNumber}&pin=${pin}`);
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
            <h2 className="text-lg font-bold mb-1">학번과 비밀번호를 입력하세요</h2>
            <p className="text-xs text-slate-400 mb-4">비밀번호 초기값: 학번 뒤 4자리</p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="text" value={studentNumber}
                onChange={e => setStudentNumber(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
                placeholder="학번 (예: 10101)"
                className="border rounded-lg px-4 py-2.5 text-sm flex-1 focus:ring-2 focus:ring-blue-300 outline-none"
                autoFocus
              />
              <input
                type="password" value={pin}
                onChange={e => setPin(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
                placeholder="비밀번호"
                maxLength={4}
                className="border rounded-lg px-4 py-2.5 text-sm w-28 focus:ring-2 focus:ring-blue-300 outline-none"
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
                        onClick={async () => {
                          setSelectedArtifact(a);
                          setShowReflectionForm(false);
                          const ref = await getReflection(a.id);
                          setReflection(ref);
                          if (ref) setReflectionForm({ agree: ref.agree, disagree: ref.disagree || '', next_time: ref.next_time });
                          else setReflectionForm({ agree: '', disagree: '', next_time: '' });
                        }}
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
                          {/* 피드백 성찰 */}
                          <div className="bg-white rounded-xl border p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold">피드백 성찰</h4>
                              <span className="text-xs text-slate-400">PAIRR 모델</span>
                            </div>

                            {reflection && !showReflectionForm ? (
                              <div className="space-y-3">
                                <div className="bg-emerald-50 rounded-lg p-3">
                                  <p className="text-xs font-semibold text-emerald-700 mb-1">공감되는 부분</p>
                                  <p className="text-sm text-emerald-800">{reflection.agree}</p>
                                </div>
                                {reflection.disagree && (
                                  <div className="bg-orange-50 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-orange-700 mb-1">다르게 생각하는 부분</p>
                                    <p className="text-sm text-orange-800">{reflection.disagree}</p>
                                  </div>
                                )}
                                <div className="bg-indigo-50 rounded-lg p-3">
                                  <p className="text-xs font-semibold text-indigo-700 mb-1">다음에 바꿀 점</p>
                                  <p className="text-sm text-indigo-800">{reflection.next_time}</p>
                                </div>
                                <button onClick={() => setShowReflectionForm(true)}
                                  className="text-xs text-slate-400 hover:text-blue-600">수정하기</button>
                              </div>
                            ) : (
                              <>
                                {!showReflectionForm && !reflection && (
                                  <p className="text-xs text-slate-500 mb-3">
                                    피드백을 읽고 성찰을 작성하면, 다음 산출물의 질이 높아집니다.
                                  </p>
                                )}
                                {showReflectionForm || !reflection ? (
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-xs font-medium text-slate-600 block mb-1">
                                        이 피드백에서 가장 공감되는 부분은? <span className="text-red-400">*</span>
                                      </label>
                                      <textarea value={reflectionForm.agree}
                                        onChange={e => setReflectionForm(f => ({ ...f, agree: e.target.value }))}
                                        className="w-full border rounded-lg p-2.5 text-sm resize-none focus:ring-2 focus:ring-blue-300 outline-none"
                                        rows={2} placeholder="피드백 중 맞다고 느낀 부분을 적어주세요" />
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-slate-600 block mb-1">
                                        다르게 생각하는 부분이 있다면? <span className="text-slate-300">(선택)</span>
                                      </label>
                                      <textarea value={reflectionForm.disagree}
                                        onChange={e => setReflectionForm(f => ({ ...f, disagree: e.target.value }))}
                                        className="w-full border rounded-lg p-2.5 text-sm resize-none focus:ring-2 focus:ring-blue-300 outline-none"
                                        rows={2} placeholder="피드백과 다른 의견이 있으면 적어주세요" />
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-slate-600 block mb-1">
                                        다음에 같은 과제를 쓴다면 뭘 바꿀 건가요? <span className="text-red-400">*</span>
                                      </label>
                                      <textarea value={reflectionForm.next_time}
                                        onChange={e => setReflectionForm(f => ({ ...f, next_time: e.target.value }))}
                                        className="w-full border rounded-lg p-2.5 text-sm resize-none focus:ring-2 focus:ring-blue-300 outline-none"
                                        rows={2} placeholder="구체적인 개선 계획을 적어주세요" />
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={async () => {
                                          if (!reflectionForm.agree.trim() || !reflectionForm.next_time.trim()) return;
                                          setSavingReflection(true);
                                          try {
                                            const saved = await saveReflection({
                                              artifact_id: selectedArtifact.id,
                                              student_id: student.id,
                                              ...reflectionForm,
                                            });
                                            setReflection(saved);
                                            setShowReflectionForm(false);
                                          } catch { /* skip */ }
                                          finally { setSavingReflection(false); }
                                        }}
                                        disabled={savingReflection || !reflectionForm.agree.trim() || !reflectionForm.next_time.trim()}
                                        className="bg-blue-600 text-white rounded-lg px-4 py-2 text-xs font-medium hover:bg-blue-700 disabled:bg-slate-300">
                                        {savingReflection ? '저장 중...' : '성찰 저장'}
                                      </button>
                                      {showReflectionForm && (
                                        <button onClick={() => setShowReflectionForm(false)}
                                          className="text-xs text-slate-400 hover:text-slate-600 px-3 py-2">취소</button>
                                      )}
                                    </div>
                                  </div>
                                ) : null}
                              </>
                            )}
                          </div>
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
