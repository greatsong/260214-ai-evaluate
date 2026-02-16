'use client';
import {
  RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

/**
 * 레이더 차트 — 개별 평가용
 */
export function ScoreRadarChart({ scores, rubricItems }) {
  if (!scores) return null;

  const data = Object.entries(scores).map(([key, val]) => ({
    item: rubricItems?.[key]?.name || key,
    score: typeof val === 'object' ? val.score : val,
    fullMark: 4,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="item" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis angle={90} domain={[0, 4]} tickCount={5} tick={{ fontSize: 10 }} />
        <Radar name="점수" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
        <Tooltip />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}

/**
 * FACT 레이더 차트 — 포트폴리오용
 */
export function FACTRadarChart({ factScores }) {
  if (!factScores) return null;

  const labels = {
    F: '실현력 (F)',
    A: 'AI 리터러시 (A)',
    C: '비판적 사고 (C)',
    T: '협업·소통 (T)',
  };

  const data = Object.entries(factScores).map(([key, val]) => ({
    item: labels[key] || key,
    score: typeof val === 'object' ? val.score : val,
    fullMark: 4,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="item" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={90} domain={[0, 4]} tickCount={5} tick={{ fontSize: 10 }} />
        <Radar name="FACT" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
        <Tooltip />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}

/**
 * 성장 꺾은선 차트 — 성장 분석용
 */
export function GrowthLineChart({ individualScores, rubricItems }) {
  if (!individualScores || individualScores.length === 0) return null;

  // individualScores: [{ artifact_index, date, scores: { key: score } }, ...]
  const itemKeys = Object.keys(individualScores[0].scores || {});

  const data = individualScores.map((s, i) => {
    const row = { name: s.date || `#${s.artifact_index || i + 1}` };
    itemKeys.forEach(k => { row[k] = s.scores[k]; });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 4]} tickCount={5} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        {itemKeys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={rubricItems?.[key]?.name || key}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
