'use client';
import { useState, useEffect } from 'react';
import { getStudents, getArtifacts, getEvaluations } from '@/lib/api';
import { PRACTICE_TYPES, PRACTICE_SHORT } from '@/lib/constants';

export default function ClassPage() {
  const [students, setStudents] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    Promise.all([getStudents(), getArtifacts({}), getEvaluations({})])
      .then(([s, a, e]) => { setStudents(s); setArtifacts(a); setEvaluations(e); })
      .catch(console.error);
  }, []);

  // 학생별, 실천유형별 산출물/평가 매핑
  const studentStats = students.map(student => {
    const studentArtifacts = artifacts.filter(a => a.student_id === student.id);
    const studentArtifactIds = new Set(studentArtifacts.map(a => a.id));
    const studentEvals = evaluations.filter(e => studentArtifactIds.has(e.artifact_id));

    const byPractice = {};
    Object.keys(PRACTICE_TYPES).forEach(pt => {
      const ptArtifacts = studentArtifacts.filter(a => a.practice_type === pt);
      const ptArtifactIds = new Set(ptArtifacts.map(a => a.id));
      const ptEvals = studentEvals.filter(e => ptArtifactIds.has(e.artifact_id));

      const scores = ptEvals
        .filter(e => e.total_score)
        .map(e => e.total_score);
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

      byPractice[pt] = {
        artifactCount: ptArtifacts.length,
        evalCount: ptEvals.length,
        avgScore,
      };
    });

    return { ...student, byPractice, totalArtifacts: studentArtifacts.length, totalEvals: studentEvals.length };
  });

  // 전체 통계
  const totalScores = evaluations.filter(e => e.total_score).map(e => e.total_score);
  const avgAll = totalScores.length > 0 ? (totalScores.reduce((a, b) => a + b, 0) / totalScores.length) : 0;

  const scoreCell = (score) => {
    if (score === null) return <td className="p-2 text-center text-xs text-slate-300">-</td>;
    const bg =
      score >= 3.5 ? 'bg-emerald-100 text-emerald-800' :
      score >= 2.5 ? 'bg-blue-100 text-blue-800' :
      score >= 1.5 ? 'bg-amber-100 text-amber-800' :
      'bg-red-100 text-red-800';
    return <td className={`p-2 text-center text-xs font-bold rounded ${bg}`}>{score.toFixed(1)}</td>;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">학급 현황</h1>

      {/* 요약 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-sm text-slate-500">학생 수</p>
          <p className="text-2xl font-bold">{students.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-sm text-slate-500">산출물</p>
          <p className="text-2xl font-bold">{artifacts.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-sm text-slate-500">평가 완료</p>
          <p className="text-2xl font-bold">{evaluations.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-sm text-slate-500">전체 평균</p>
          <p className="text-2xl font-bold">{avgAll > 0 ? avgAll.toFixed(2) : '-'}</p>
        </div>
      </div>

      {/* 히트맵 테이블 */}
      <div className="bg-white rounded-lg shadow-sm p-5 overflow-x-auto">
        <h3 className="font-semibold mb-3">학생별 평가 현황 (평균 점수)</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left p-2">학생</th>
              <th className="text-left p-2">반</th>
              {Object.entries(PRACTICE_SHORT).map(([k, v]) => (
                <th key={k} className="text-center p-2 text-xs">{v}</th>
              ))}
              <th className="text-center p-2">산출물</th>
              <th className="text-center p-2">평가</th>
            </tr>
          </thead>
          <tbody>
            {studentStats.map(s => (
              <tr key={s.id} className="border-t hover:bg-slate-50">
                <td className="p-2 font-medium">{s.name}</td>
                <td className="p-2 text-xs text-slate-500">{s.class_name}</td>
                {Object.keys(PRACTICE_TYPES).map(pt => scoreCell(s.byPractice[pt]?.avgScore))}
                <td className="p-2 text-center text-xs">{s.totalArtifacts}</td>
                <td className="p-2 text-center text-xs">{s.totalEvals}</td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={8} className="p-6 text-center text-slate-400">등록된 학생이 없습니다</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 최근 평가 */}
      <div className="bg-white rounded-lg shadow-sm p-5 mt-6">
        <h3 className="font-semibold mb-3">최근 평가</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left p-2">Artifact ID</th>
              <th className="text-left p-2">평가 유형</th>
              <th className="text-center p-2">점수</th>
              <th className="text-left p-2">날짜</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.slice(0, 15).map(e => (
              <tr key={e.id} className="border-t">
                <td className="p-2">#{e.artifact_id}</td>
                <td className="p-2">{e.eval_type}</td>
                <td className="p-2 text-center font-bold">{e.total_score?.toFixed(2) || 'N/A'}</td>
                <td className="p-2 text-xs text-slate-500">{new Date(e.created_at).toLocaleDateString('ko-KR')}</td>
              </tr>
            ))}
            {evaluations.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-slate-400">평가 기록이 없습니다</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
