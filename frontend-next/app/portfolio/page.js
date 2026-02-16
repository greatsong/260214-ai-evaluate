'use client';
import { useState, useEffect } from 'react';
import { getStudents, requestPortfolioFeedback, requestSchoolRecord } from '@/lib/api';
import { FACTRadarChart } from '@/components/Charts';
import LevelBadge from '@/components/LevelBadge';

export default function PortfolioPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [portfolio, setPortfolio] = useState(null);
  const [schoolRecord, setSchoolRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recordLoading, setRecordLoading] = useState(false);

  useEffect(() => { getStudents().then(setStudents).catch(console.error); }, []);

  const studentObj = students.find(s => s.id === parseInt(selectedStudent));

  const handlePortfolio = async () => {
    if (!studentObj) return;
    try {
      setLoading(true);
      setPortfolio(null);
      setSchoolRecord(null);
      const result = await requestPortfolioFeedback({
        student_id: studentObj.id,
        student_name: studentObj.name
      });
      setPortfolio(result);
    } catch (e) {
      alert('오류: ' + (e.response?.data?.error || e.message));
    } finally { setLoading(false); }
  };

  const handleSchoolRecord = async () => {
    if (!studentObj) return;
    try {
      setRecordLoading(true);
      const result = await requestSchoolRecord({
        student_id: studentObj.id,
        student_name: studentObj.name,
        portfolio_result: portfolio
      });
      setSchoolRecord(result);
    } catch (e) {
      alert('오류: ' + (e.response?.data?.error || e.message));
    } finally { setRecordLoading(false); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => alert('클립보드에 복사되었습니다.'));
  };

  const factLabels = { F: '실현력', A: 'AI 리터러시', C: '비판적 사고', T: '협업·소통' };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">포트폴리오</h1>

      <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">학생</label>
            <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm">
              <option value="">선택하세요</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class_name})</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handlePortfolio} disabled={loading || !selectedStudent}
              className="w-full bg-purple-600 text-white rounded px-4 py-2 text-sm hover:bg-purple-700 disabled:bg-slate-300">
              {loading ? 'FACT 분석 중...' : 'FACT 종합 평가'}
            </button>
          </div>
          <div className="flex items-end">
            <button onClick={handleSchoolRecord} disabled={recordLoading || !portfolio}
              className="w-full bg-amber-600 text-white rounded px-4 py-2 text-sm hover:bg-amber-700 disabled:bg-slate-300">
              {recordLoading ? '생성 중...' : '생기부 초안 생성'}
            </button>
          </div>
        </div>
      </div>

      {portfolio && (
        <div className="space-y-4">
          {/* FACT 차트 + 점수 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h3 className="font-semibold mb-3">FACT 프레임워크</h3>
              <FACTRadarChart factScores={portfolio.fact_scores} />
              {portfolio.total_score && (
                <div className="text-center mt-2">
                  <span className="text-2xl font-bold text-purple-700">{portfolio.total_score.toFixed(2)}</span>
                  <span className="text-sm text-slate-400"> / 4.0</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-5">
              <h3 className="font-semibold mb-3">FACT 상세</h3>
              <div className="space-y-3">
                {portfolio.fact_scores && Object.entries(portfolio.fact_scores).map(([key, val]) => {
                  const score = typeof val === 'object' ? val.score : val;
                  const feedback = typeof val === 'object' ? val.feedback : '';
                  const evidence = typeof val === 'object' ? val.evidence : '';
                  return (
                    <div key={key} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm">{factLabels[key] || key} ({key})</span>
                        <span className={`text-sm font-bold ${score >= 3 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {score}/4
                        </span>
                      </div>
                      {evidence && <p className="text-xs text-slate-500 italic mb-1">{evidence}</p>}
                      {feedback && <p className="text-xs text-slate-700">{feedback}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 종합 서술 */}
          {portfolio.overall_narrative && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">종합 평가</h4>
              <p className="text-sm leading-relaxed">{portfolio.overall_narrative}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {portfolio.top_strengths && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">핵심 강점</h4>
                <ul className="text-sm space-y-1">
                  {portfolio.top_strengths.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
            )}
            {portfolio.growth_areas && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">성장 필요 영역</h4>
                <ul className="text-sm space-y-1">
                  {portfolio.growth_areas.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
            )}
          </div>

          {portfolio.teacher_recommendation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">교사 지도 제안</h4>
              <p className="text-sm leading-relaxed">{portfolio.teacher_recommendation}</p>
            </div>
          )}
        </div>
      )}

      {/* 생기부 초안 */}
      {schoolRecord && (
        <div className="mt-6 bg-white rounded-lg shadow-sm p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">생기부 교과 세부능력 및 특기사항 초안</h3>
            <button onClick={() => copyToClipboard(schoolRecord.draft)}
              className="bg-slate-100 hover:bg-slate-200 rounded px-3 py-1 text-xs">
              복사
            </button>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded p-4 text-sm leading-relaxed whitespace-pre-wrap">
            {schoolRecord.draft}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>{schoolRecord.char_count || schoolRecord.draft?.length}자</span>
            {schoolRecord.key_points && (
              <span>강조 역량: {schoolRecord.key_points.join(', ')}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
