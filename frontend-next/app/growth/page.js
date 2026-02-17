'use client';
import { useState, useEffect, useCallback } from 'react';
import { getStudents, getArtifacts, requestGrowthAnalysis, getRubrics } from '@/lib/api';
import { GrowthLineChart } from '@/components/Charts';
import { useToast } from '@/components/Toast';
import { StudentSelector, PracticeTypeSelector } from '@/components/StudentSelector';

export default function GrowthPage() {
  const [students, setStudents] = useState([]);
  const [rubrics, setRubrics] = useState({});
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedPractice, setSelectedPractice] = useState('p1_discomfort');
  const [artifacts, setArtifacts] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showError } = useToast();

  useEffect(() => {
    Promise.all([getStudents(), getRubrics()])
      .then(([s, r]) => { setStudents(s); setRubrics(r); })
      .catch(() => showError('데이터 로드 실패'));
  }, []);

  const fetchArtifacts = useCallback(async () => {
    if (!selectedStudent) return;
    try {
      const data = await getArtifacts({ student_id: selectedStudent, practice_type: selectedPractice });
      setArtifacts(data);
    } catch (e) { showError('산출물 조회 실패'); }
  }, [selectedStudent, selectedPractice]);

  useEffect(() => { fetchArtifacts(); setAnalysis(null); }, [fetchArtifacts]);

  const handleAnalyze = async () => {
    if (artifacts.length < 2) { showError('성장 분석을 위해 최소 2개 산출물이 필요합니다.'); return; }
    try {
      setLoading(true);
      const result = await requestGrowthAnalysis({
        student_id: parseInt(selectedStudent),
        practice_type: selectedPractice,
        artifacts: artifacts
      });
      setAnalysis(result.analysis);
    } catch (e) {
      showError('분석 오류: ' + (e.response?.data?.error?.message || e.response?.data?.error || e.message));
    } finally { setLoading(false); }
  };

  const currentRubric = rubrics[selectedPractice];
  const studentName = students.find(s => s.id === parseInt(selectedStudent))?.name;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">성장 분석</h1>

      <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <StudentSelector students={students} value={selectedStudent}
            onChange={setSelectedStudent} label="학생" />
          <PracticeTypeSelector value={selectedPractice}
            onChange={setSelectedPractice} label="실천 활동" />
          <div className="flex items-end">
            <button onClick={handleAnalyze} disabled={loading || artifacts.length < 2}
              className="w-full bg-emerald-600 text-white rounded px-4 py-2 text-sm hover:bg-emerald-700 disabled:bg-slate-300">
              {loading ? '분석 중...' : `성장 분석 실행 (${artifacts.length}개 산출물)`}
            </button>
          </div>
        </div>
      </div>

      {selectedStudent && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="font-semibold text-sm mb-3">산출물 타임라인 ({artifacts.length}개)</h3>
          {artifacts.length === 0 ? (
            <p className="text-sm text-slate-400">해당 유형의 산출물이 없습니다</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {artifacts.map((a, i) => (
                <div key={a.id} className="flex-shrink-0 bg-slate-50 rounded p-3 w-48">
                  <div className="text-xs text-slate-500">#{i + 1} · {a.date}</div>
                  <p className="text-xs mt-1 line-clamp-3">{a.raw_text}</p>
                </div>
              ))}
            </div>
          )}
          {artifacts.length < 2 && artifacts.length > 0 && (
            <p className="text-xs text-amber-600 mt-2">성장 분석을 위해 최소 2개 산출물이 필요합니다.</p>
          )}
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          {/* 꺾은선 그래프 */}
          {analysis.individual_scores && (
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h3 className="font-semibold mb-3">항목별 성장 추이</h3>
              <GrowthLineChart individualScores={analysis.individual_scores} rubricItems={currentRubric?.items} />
            </div>
          )}

          {/* 변화 추이 표 */}
          {analysis.trajectory && (
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h3 className="font-semibold mb-3">항목별 변화</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left p-2">항목</th>
                    <th className="text-center p-2">초기</th>
                    <th className="text-center p-2">최종</th>
                    <th className="text-center p-2">변화</th>
                    <th className="text-center p-2">추세</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(analysis.trajectory).map(([key, t]) => (
                    <tr key={key} className="border-t">
                      <td className="p-2 font-medium">{currentRubric?.items?.[key]?.name || key}</td>
                      <td className="p-2 text-center">{t.start}</td>
                      <td className="p-2 text-center">{t.end}</td>
                      <td className={`p-2 text-center font-bold ${t.change > 0 ? 'text-emerald-600' : t.change < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                        {t.change > 0 ? '+' : ''}{t.change}
                      </td>
                      <td className="p-2 text-center">
                        {t.trend === '상승' ? '📈' : t.trend === '하락' ? '📉' : '➡️'} {t.trend}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 서술 */}
          <div className="grid grid-cols-2 gap-4">
            {analysis.growth_narrative && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">성장 스토리</h4>
                <p className="text-sm leading-relaxed">{analysis.growth_narrative}</p>
              </div>
            )}
            {analysis.strongest_growth && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">가장 큰 성장</h4>
                <p className="text-sm leading-relaxed">{analysis.strongest_growth}</p>
              </div>
            )}
            {analysis.area_of_concern && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">관심 필요 영역</h4>
                <p className="text-sm leading-relaxed">{analysis.area_of_concern}</p>
              </div>
            )}
            {analysis.next_steps && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">다음 단계 제안</h4>
                <p className="text-sm leading-relaxed">{analysis.next_steps}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
