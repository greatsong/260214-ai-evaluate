'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStudents, getArtifacts, getEvaluations } from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, artifacts: 0, evaluations: 0 });

  useEffect(() => {
    Promise.all([getStudents(), getArtifacts({}), getEvaluations({})])
      .then(([s, a, e]) => setStats({ students: s.length, artifacts: a.length, evaluations: e.length }))
      .catch(() => {});
  }, []);

  const cards = [
    { label: '등록 학생', value: stats.students, icon: '👥', href: '/students', color: 'border-blue-500' },
    { label: '산출물', value: stats.artifacts, icon: '📝', href: '/artifacts', color: 'border-emerald-500' },
    { label: '평가 완료', value: stats.evaluations, icon: '⭐', href: '/evaluate', color: 'border-amber-500' },
  ];

  const features = [
    { title: '개별 평가', desc: '루브릭 기반 AI 채점 + 구조화 피드백', href: '/evaluate' },
    { title: '성장 분석', desc: '시간순 산출물 비교 + 꺾은선 그래프', href: '/growth' },
    { title: '포트폴리오', desc: 'FACT 프레임워크 종합 평가 + 생기부 초안', href: '/portfolio' },
    { title: '학급 현황', desc: '전체 학생 평가 현황 한눈에', href: '/class' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {cards.map(c => (
          <Link key={c.href} href={c.href}
            className={`bg-white rounded-lg p-5 border-l-4 ${c.color} shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{c.label}</p>
                <p className="text-3xl font-bold mt-1">{c.value}</p>
              </div>
              <span className="text-3xl">{c.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">주요 기능</h2>
      <div className="grid grid-cols-2 gap-4">
        {features.map(f => (
          <Link key={f.href} href={f.href}
            className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold mb-1">{f.title}</h3>
            <p className="text-sm text-slate-500">{f.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
