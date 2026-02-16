/**
 * 데모 모드용 가상 데이터
 */

const DEMO_DATA = {
  students: [
    { id: 1, student_number: "001", name: "김철수", class_name: "1반", number: 1, created_at: "2026-02-10 10:00:00" },
    { id: 2, student_number: "002", name: "이영희", class_name: "1반", number: 2, created_at: "2026-02-10 10:05:00" },
    { id: 3, student_number: "003", name: "박민준", class_name: "1반", number: 3, created_at: "2026-02-10 10:10:00" },
    { id: 4, student_number: "004", name: "최지은", class_name: "1반", number: 4, created_at: "2026-02-11 09:00:00" },
    { id: 5, student_number: "005", name: "정준호", class_name: "1반", number: 5, created_at: "2026-02-11 09:05:00" }
  ],

  artifacts: [
    {
      id: 1,
      student_id: 1,
      practice_type: "p1_discomfort",
      raw_text: "등교 시간에 학교 정문 앞 횡단보도에서 신호가 90초나 되어서 매일 지각 위기를 겪고 있습니다. 겨울에는 추위 속에서 기다리는 것도 고통스럽고, 전교생이 같은 문제를 겪고 있습니다. 센서를 이용해 학생 밀집도를 측정하면 시청에 민원을 제기할 수 있는 자료가 될 것 같습니다.",
      date: "2026-02-10",
      session: "1차시",
      created_at: "2026-02-10 10:00:00"
    },
    {
      id: 2,
      student_id: 1,
      practice_type: "p1_discomfort",
      raw_text: "급식소 대기줄이 너무 길어서 점심시간마다 30분 이상 기다립니다. 학생 수 대비 식사 공간이 부족하고, 조리 인력도 부족한 것 같습니다. 이를 개선하면 학생들의 스트레스를 줄일 수 있을 것 같습니다.",
      date: "2026-02-12",
      session: "2차시",
      created_at: "2026-02-12 10:00:00"
    },
    {
      id: 3,
      student_id: 1,
      practice_type: "p1_discomfort",
      raw_text: "교실의 창문을 통해 햇빛이 너무 많이 들어와서 여름에는 매우 덥습니다. 선풍기가 3개밖에 없어서 시원하지 않습니다. 냉방기를 설치하면 학습 환경이 훨씬 나아질 것 같습니다.",
      date: "2026-02-14",
      session: "3차시",
      created_at: "2026-02-14 10:00:00"
    },
    {
      id: 4,
      student_id: 2,
      practice_type: "p1_discomfort",
      raw_text: "학교 WiFi가 자주 끊어져서 온라인 수업이나 조사 활동에 어려움을 겪습니다. 특히 점심시간에는 사용자가 많아서 거의 연결되지 않습니다. 무선 라우터를 추가로 설치하면 해결될 것 같습니다.",
      date: "2026-02-11",
      session: "1차시",
      created_at: "2026-02-11 10:00:00"
    },
    {
      id: 5,
      student_id: 2,
      practice_type: "p1_discomfort",
      raw_text: "도서관 좌석이 부족해서 자습할 공간을 찾기 어렵습니다. 방과 후에 도서관을 이용하려면 먼저 와서 자리를 차지해야 하는데, 모든 학생이 도서관을 이용할 수 없습니다. 도서관을 증축하거나 다른 자습 공간을 만들어야 합니다.",
      date: "2026-02-13",
      session: "2차시",
      created_at: "2026-02-13 10:00:00"
    },
    {
      id: 6,
      student_id: 3,
      practice_type: "p1_discomfort",
      raw_text: "체육관에서 실내 운동화를 잃어버린 학생들이 많습니다. 신발 보관함이 너무 작고 잠금장치가 제대로 되어 있지 않습니다. 더 큰 보관함을 설치하고 보안을 강화하면 도움이 될 것 같습니다.",
      date: "2026-02-10",
      session: "1차시",
      created_at: "2026-02-10 11:00:00"
    },
    {
      id: 7,
      student_id: 4,
      practice_type: "p1_discomfort",
      raw_text: "화장실이 자주 막혀서 불편합니다. 특히 점심시간과 방과 후에 더 심합니다. 화장실 개수를 늘리거나 정기적으로 점검을 강화하면 좋을 것 같습니다.",
      date: "2026-02-11",
      session: "2차시",
      created_at: "2026-02-11 11:00:00"
    },
    {
      id: 8,
      student_id: 5,
      practice_type: "p1_discomfort",
      raw_text: "운동장의 일부가 보수 중이라 체육 활동 공간이 매우 제한적입니다. 빠른 복구를 원합니다.",
      date: "2026-02-12",
      session: "1차시",
      created_at: "2026-02-12 11:00:00"
    }
  ],

  evaluations: [
    {
      id: 1,
      artifact_id: 1,
      eval_type: "individual",
      scores: JSON.stringify({
        "명확성": 4,
        "구체성": 3,
        "실행가능성": 4,
        "영향력": 3
      }),
      total_score: 14,
      feedback: "매우 구체적인 문제 상황을 제시했고, 해결 방안까지 명확하게 제안했습니다. 센서를 이용한 데이터 수집 아이디어는 매우 실용적입니다.",
      created_at: "2026-02-10 11:00:00"
    },
    {
      id: 2,
      artifact_id: 2,
      eval_type: "individual",
      scores: JSON.stringify({
        "명확성": 3,
        "구체성": 3,
        "실행가능성": 3,
        "영향력": 4
      }),
      total_score: 13,
      feedback: "학생들의 실제 불편함을 잘 파악했습니다. 급식소 개선은 전체 학생에게 영향이 클 것 같습니다.",
      created_at: "2026-02-12 11:00:00"
    },
    {
      id: 3,
      artifact_id: 4,
      eval_type: "individual",
      scores: JSON.stringify({
        "명확성": 4,
        "구체성": 4,
        "실행가능성": 3,
        "영향력": 3
      }),
      total_score: 14,
      feedback: "WiFi 문제의 구체적인 상황 분석이 좋습니다. 해결 방안도 명확합니다.",
      created_at: "2026-02-11 11:00:00"
    }
  ],

  growthAnalyses: [
    {
      id: 1,
      student_id: 1,
      practice_type: "p1_discomfort",
      artifact_ids: JSON.stringify([1, 2, 3]),
      analysis: JSON.stringify({
        trajectory: "향상",
        description: "문제 해결 능력이 점진적으로 향상되고 있습니다.",
        details: {
          첫번째: "횡단보도 문제 - 센서 활용 제안",
          두번째: "급식소 문제 - 개선 방안 제시",
          세번째: "냉방 문제 - 구체적 해결책 제안"
        },
        recommendation: "계속해서 실제 문제를 관찰하고 창의적인 해결책을 제시하도록 격려해주세요."
      }),
      created_at: "2026-02-14 10:00:00"
    }
  ],

  portfolioFeedback: {
    studentId: 1,
    studentName: "김철수",
    overallAssessment: "매우 우수",
    strengths: [
      "실생활의 불편함을 예민하게 관찰",
      "문제를 명확하게 표현",
      "데이터 기반의 해결책 제시"
    ],
    areasForImprovement: [
      "해결책의 비용-효과 분석 추가",
      "관련 이해관계자와의 협력 방안 모색"
    ],
    nextSteps: "다음 프로젝트에서는 실제로 문제 해결을 시도해보세요."
  }
};

// 데모 모드 전환 함수
export const isDemoMode = () => {
  return localStorage.getItem('DEMO_MODE') === 'true';
};

export const setDemoMode = (enabled) => {
  if (enabled) {
    localStorage.setItem('DEMO_MODE', 'true');
  } else {
    localStorage.removeItem('DEMO_MODE');
  }
};

// 데모 데이터 조회 함수들
export const getStudents = () => {
  return Promise.resolve(DEMO_DATA.students);
};

export const getArtifacts = (studentId, practiceType) => {
  let filtered = DEMO_DATA.artifacts;
  if (studentId) {
    filtered = filtered.filter(a => a.student_id === parseInt(studentId));
  }
  if (practiceType) {
    filtered = filtered.filter(a => a.practice_type === practiceType);
  }
  return Promise.resolve(filtered);
};

export const getArtifact = (id) => {
  const artifact = DEMO_DATA.artifacts.find(a => a.id === parseInt(id));
  return Promise.resolve(artifact);
};

export const getEvaluations = (artifactId, studentId, evalType) => {
  let filtered = DEMO_DATA.evaluations;
  if (artifactId) {
    filtered = filtered.filter(e => e.artifact_id === parseInt(artifactId));
  }
  if (studentId) {
    const studentArtifacts = DEMO_DATA.artifacts
      .filter(a => a.student_id === parseInt(studentId))
      .map(a => a.id);
    filtered = filtered.filter(e => studentArtifacts.includes(e.artifact_id));
  }
  if (evalType) {
    filtered = filtered.filter(e => e.eval_type === evalType);
  }
  return Promise.resolve(filtered);
};

export const getGrowthAnalyses = (studentId) => {
  const analyses = DEMO_DATA.growthAnalyses.filter(
    a => !studentId || a.student_id === parseInt(studentId)
  );
  return Promise.resolve(analyses);
};

export const getPortfolioFeedback = (studentId) => {
  return Promise.resolve(DEMO_DATA.portfolioFeedback);
};

export default DEMO_DATA;
