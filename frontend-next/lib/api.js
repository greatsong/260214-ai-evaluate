import axios from 'axios';
import {
  demoStudents, demoArtifacts, demoEvaluations,
  demoGrowthAnalysis, demoPortfolio, demoSchoolRecord
} from './demoData';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000,
});

// ============================================================
// 데모 모드 상태
// ============================================================

function getInitialDemoMode() {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem('demoMode');
  return stored === null ? true : stored === 'true';
}

let _demoMode = getInitialDemoMode();

export function isDemoMode() { return _demoMode; }
export function setDemoMode(val) {
  _demoMode = val;
  if (typeof window !== 'undefined') localStorage.setItem('demoMode', String(val));
}

// ============================================================
// 루브릭 (데모용 축약)
// ============================================================

const demoRubrics = {
  p1_discomfort: {
    name: "실천 1: 불편함 수집", maxScore: 12,
    items: {
      specificity: { name: "불편함의 구체성" },
      classification: { name: "분류의 적절성" },
      reasoning: { name: "선택 이유의 깊이" },
    }
  },
  p2_comparison: {
    name: "실천 2: AI와 비교하기", maxScore: 12,
    items: {
      unique_finding: { name: "나만 찾은 것의 질" },
      comparison_depth: { name: "비교 분석 깊이" },
      decision_quality: { name: "선택 이유 (결정력)" },
    }
  },
  p3_definition: {
    name: "실천 3: 문제 정의서", maxScore: 28,
    items: {
      problem_definition: { name: "문제 정의" },
      specifics: { name: "구체성" },
      who: { name: "대상 인식" },
      urgency: { name: "긴급성" },
      ai_usage: { name: "AI 활용" },
      critical_thinking: { name: "비판적 사고" },
      decision_reason: { name: "결정 이유" },
    }
  },
  p4_ai_log: {
    name: "실천 4: AI 활용 일지", maxScore: 20,
    items: {
      prompt_specificity: { name: "프롬프트 구체성" },
      ai_response_summary: { name: "AI 결과 요약" },
      modifications: { name: "수정 내용" },
      problem_recognition: { name: "문제점 인식" },
      own_decision: { name: "자기 결정" },
    }
  },
  p7_reflection: {
    name: "실천 7: 성장 성찰문", maxScore: 16,
    items: {
      problem_finding_change: { name: "문제 발견 능력의 변화" },
      ai_collaboration_change: { name: "AI 협업 방식의 변화" },
      important_decision: { name: "가장 중요한 결정" },
      self_understanding: { name: "자기 이해" },
    }
  }
};

// ============================================================
// 학생
// ============================================================

export async function getStudents() {
  if (_demoMode) return [...demoStudents];
  return api.get('/students').then(r => r.data);
}

export async function addStudent(data) {
  if (_demoMode) {
    const newId = Math.max(...demoStudents.map(s => s.id)) + 1;
    const s = { id: newId, ...data, created_at: new Date().toISOString() };
    demoStudents.push(s);
    return s;
  }
  return api.post('/students', data).then(r => r.data);
}

export async function deleteStudent(id) {
  if (_demoMode) {
    const idx = demoStudents.findIndex(s => s.id === id);
    if (idx !== -1) demoStudents.splice(idx, 1);
    return { success: true };
  }
  return api.delete(`/students/${id}`).then(r => r.data);
}

export async function importStudentsExcel(fileData, fileName) {
  if (_demoMode) return { total: 0, successCount: 0, failureCount: 0, results: { success: [], failed: [] } };
  return api.post('/students/import/excel', { fileData, fileName }).then(r => r.data);
}

// ============================================================
// 산출물
// ============================================================

export async function getArtifacts(params = {}) {
  if (_demoMode) {
    let result = [...demoArtifacts];
    if (params.student_id) result = result.filter(a => a.student_id === Number(params.student_id));
    if (params.practice_type) result = result.filter(a => a.practice_type === params.practice_type);
    return result;
  }
  return api.get('/artifacts', { params }).then(r => r.data);
}

export async function addArtifact(data) {
  if (_demoMode) {
    const newId = Math.max(...demoArtifacts.map(a => a.id)) + 1;
    const a = { id: newId, ...data, created_at: new Date().toISOString() };
    demoArtifacts.push(a);
    return a;
  }
  return api.post('/artifacts', data).then(r => r.data);
}

export async function deleteArtifact(id) {
  if (_demoMode) {
    const idx = demoArtifacts.findIndex(a => a.id === id);
    if (idx !== -1) demoArtifacts.splice(idx, 1);
    return { success: true };
  }
  return api.delete(`/artifacts/${id}`).then(r => r.data);
}

// ============================================================
// 평가
// ============================================================

export async function getEvaluations(params = {}) {
  if (_demoMode) {
    let result = demoEvaluations.map(e => ({
      ...e,
      scores: typeof e.scores === 'string' ? JSON.parse(e.scores) : e.scores,
    }));
    if (params.artifact_id) result = result.filter(e => e.artifact_id === Number(params.artifact_id));
    return result;
  }
  return api.get('/evaluations', { params }).then(r => r.data);
}

export async function evaluateArtifact(data) {
  if (_demoMode) {
    await new Promise(r => setTimeout(r, 1000));
    const existing = demoEvaluations.find(e => e.artifact_id === data.artifact_id);
    if (existing) {
      const scores = typeof existing.scores === 'string' ? JSON.parse(existing.scores) : existing.scores;
      const fb = typeof existing.feedback === 'string' ? JSON.parse(existing.feedback) : (existing.feedback || {});
      return {
        ...existing, item_scores: scores, scores,
        praise: fb.praise || '', improvement: fb.improvement || '', action_guide: fb.action_guide || '',
      };
    }
    return {
      item_scores: { sample: { score: 2, evidence: "데모", feedback: "실제 평가를 위해 백엔드를 연결하세요." } },
      total_score: 2.0, sum_score: 2, max_score: 4, level: '보통',
      praise: "데모 모드", improvement: "백엔드 연결 후 사용", action_guide: "데모 OFF 후 사용"
    };
  }
  return api.post('/evaluate', data).then(r => r.data);
}

// ============================================================
// 성장 분석
// ============================================================

export async function requestGrowthAnalysis(data) {
  if (_demoMode) {
    await new Promise(r => setTimeout(r, 800));
    return { analysis: demoGrowthAnalysis };
  }
  return api.post('/growth-analysis', data).then(r => r.data);
}

// ============================================================
// 포트폴리오
// ============================================================

export async function requestPortfolioFeedback(data) {
  if (_demoMode) {
    await new Promise(r => setTimeout(r, 800));
    return demoPortfolio;
  }
  return api.post('/portfolio-feedback', data).then(r => r.data);
}

// ============================================================
// 생기부
// ============================================================

export async function requestSchoolRecord(data) {
  if (_demoMode) {
    await new Promise(r => setTimeout(r, 800));
    return demoSchoolRecord;
  }
  return api.post('/school-record', data).then(r => r.data);
}

// ============================================================
// 루브릭
// ============================================================

export async function getRubrics() {
  if (_demoMode) return demoRubrics;
  return api.get('/rubrics').then(r => r.data);
}

export default api;
