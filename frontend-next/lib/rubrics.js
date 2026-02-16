/**
 * 평가 루브릭 — ES 모듈 버전 (Vercel API Routes용)
 * backend/data/rubrics.js 와 동일한 내용
 */

const rubrics = {
  p1_discomfort: {
    name: "실천 1: 불편함 수집",
    maxScore: 12,
    levelThresholds: { 탁월: 11, 우수: 8, 보통: 5 },
    items: {
      specificity: {
        name: "불편함의 구체성",
        description: "시간·장소·빈도·영향이 얼마나 명확한지",
        levels: {
          4: "시간·장소·빈도·영향이 명확 (예: '7:50-8:00 정문 횡단보도, 90초 신호, 매일 약 40명 지각 위기')",
          3: "상황은 구체적이나 수치 부족 (예: '아침에 횡단보도 신호가 길어서 지각할 뻔한 적이 많다')",
          2: "존재하지만 모호 (예: '횡단보도 신호가 너무 길다')",
          1: "한 단어 수준 (예: '학교')"
        }
      },
      classification: {
        name: "분류의 적절성",
        description: "불편함을 어떤 카테고리로 분류했는지, 근거가 있는지",
        levels: {
          4: "분류 이유를 설명 가능, 다면적 인식",
          3: "대체로 적절한 분류",
          2: "분류했으나 근거 불명확",
          1: "분류 시도 안 함 또는 비어있음"
        }
      },
      reasoning: {
        name: "선택 이유의 깊이",
        description: "최종 불편함을 선택한 이유가 얼마나 타당한지",
        levels: {
          4: "개인 경험 + 영향 범위 + 해결 가능성 고려",
          3: "이유가 있으나 한 측면만",
          2: "'제일 불편해서' 수준",
          1: "미작성"
        }
      }
    }
  },

  p2_comparison: {
    name: "실천 2: AI와 비교하기",
    maxScore: 12,
    levelThresholds: { 탁월: 11, 우수: 8, 보통: 5 },
    items: {
      unique_finding: {
        name: "나만 찾은 것의 질",
        description: "현장 맥락 기반의 고유한 발견이 있는지",
        levels: {
          4: "현장 맥락 기반의 고유한 발견 2개 이상",
          3: "고유한 발견 1개",
          2: "AI와 비슷하지만 약간 다른 것",
          1: "비어있음"
        }
      },
      comparison_depth: {
        name: "비교 분석 깊이",
        description: "AI와 자기 발견의 차이를 어떻게 분석했는지",
        levels: {
          4: "AI와 자기 발견의 차이를 구조적으로 분석",
          3: "차이를 인식하지만 분석 부족",
          2: "단순 나열",
          1: "미작성"
        }
      },
      decision_quality: {
        name: "선택 이유 (결정력)",
        description: "가치관·경험 기반의 논리적 선택인지",
        levels: {
          4: "가치관·경험 기반 논리적 이유",
          3: "이유가 있으나 깊이 부족",
          2: "'이게 좋아서' 수준",
          1: "미작성"
        }
      }
    }
  },

  p3_definition: {
    name: "실천 3: 문제 정의서",
    maxScore: 28,
    levelThresholds: { 탁월: 25, 우수: 19, 보통: 12 },
    items: {
      problem_definition: {
        name: "문제 정의",
        description: "한 문장으로 명확하고, 측정 가능한 요소 포함 여부",
        levels: { 4: "한 문장, 측정 가능한 요소 포함", 3: "명확하지만 측정 요소 부족", 2: "모호하지만 방향 있음", 1: "매우 추상적" }
      },
      specifics: {
        name: "구체성",
        description: "시간·장소·빈도·수치가 포함되었는지",
        levels: { 4: "시간·장소·빈도·수치 모두 포함", 3: "일부 수치 포함", 2: "서술적이나 수치 없음", 1: "한 줄 미만 또는 미작성" }
      },
      who: {
        name: "대상 인식",
        description: "영향 범위와 특성이 구체적인지",
        levels: { 4: "영향 범위와 특성 구체적", 3: "대상 명시하나 구체성 부족", 2: "'학생들' 수준", 1: "미작성" }
      },
      urgency: {
        name: "긴급성",
        description: "지속 시 구체적 결과를 논리적으로 서술하는지",
        levels: { 4: "지속 시 구체적 결과를 논리적으로 서술", 3: "결과 언급하나 논리 부족", 2: "'불편하니까' 수준", 1: "미작성" }
      },
      ai_usage: {
        name: "AI 활용",
        description: "AI 답변을 요약하고 자신의 문제 맥락과 연결했는지",
        levels: { 4: "AI 답변을 구체적으로 요약 + 자기 맥락과 연결", 3: "요약했으나 맥락 연결 부족", 2: "단순 복붙", 1: "AI를 사용하지 않았거나 미기록" }
      },
      critical_thinking: {
        name: "비판적 사고 (핵심 항목)",
        description: "AI가 모르는 구체적 맥락을 지적하고, 왜 AI가 이걸 모르는지 설명하는지",
        levels: { 4: "구체적 맥락 2개 이상 빠진 것 + 이유", 3: "1개 빈틈 지적 + 설명", 2: "'좀 다른 것 같다' 수준", 1: "'없음' 또는 미작성" }
      },
      decision_reason: {
        name: "결정 이유",
        description: "개인 경험, 가치관, 실현 가능성을 종합한 논리적 이유인지",
        levels: { 4: "가치관/경험 기반 논리적 이유", 3: "이유 있으나 한 측면만", 2: "'급식은 매일 먹으니까' 수준", 1: "미작성" }
      }
    }
  },

  p4_ai_log: {
    name: "실천 4: AI 활용 일지",
    maxScore: 20,
    levelThresholds: { 탁월: 17, 우수: 13, 보통: 8 },
    items: {
      prompt_specificity: {
        name: "프롬프트 구체성",
        description: "AI에게 요청할 때 맥락·조건·형태까지 명시했는지",
        levels: { 4: "맥락·조건·출력 형태까지 명시", 3: "구체적이나 일부 조건 누락", 2: "'코드 써줘' 수준", 1: "'코드' 또는 미기록" }
      },
      ai_response_summary: {
        name: "AI 결과 요약",
        description: "AI가 준 결과의 핵심 구조를 파악하여 요약했는지",
        levels: { 4: "핵심 구조 파악하여 요약", 3: "요약했으나 구조 파악 부족", 2: "'코드 줬음' 수준", 1: "미기록" }
      },
      modifications: {
        name: "수정 내용",
        description: "뭘 바꿨는지 + 왜 바꿨는지 + 기술적 근거",
        levels: { 4: "뭘+왜 바꿨는지 + 기술적 근거", 3: "뭘 바꿨는지만", 2: "'조금 바꿈' / '수정함'", 1: "'안 바꿈' 또는 미기록" }
      },
      problem_recognition: {
        name: "문제점 인식 (핵심 항목)",
        description: "AI 코드의 구조적 한계를 지적하고 우리 환경과 연결하는지",
        levels: { 4: "구조적 한계 + 우리 맥락 연결", 3: "문제점 1개 지적", 2: "'좀 이상함' 수준", 1: "'없음' 또는 미기록" }
      },
      own_decision: {
        name: "자기 결정",
        description: "프로젝트 목적에 기반한 판단 + AI와 다른 선택의 근거",
        levels: { 4: "목적 기반 판단 + 근거", 3: "결정 있으나 근거 부족", 2: "'AI 따라함'", 1: "미기록" }
      }
    }
  },

  p5_oral: {
    name: "실천 5: 구술 면접",
    maxScore: 16,
    levelThresholds: { 탁월: 14, 우수: 10, 보통: 6 },
    teacherObservation: true,
    items: {
      core_understanding: {
        name: "핵심 이해도",
        description: "프로젝트의 기술적 선택을 자기 말로 설명하는가",
        levels: { 4: "기술적 선택의 이유를 자기 말로 명확히 설명", 3: "설명은 하지만 일부 용어를 정확히 모름", 2: "단편적 설명, 전체 구조 파악 부족", 1: "설명 불가 또는 AI 답변 반복" }
      },
      follow_up: {
        name: "후속 질문 대응",
        description: "'왜 그렇게 했어?'에 논리적으로 답하는가",
        levels: { 4: "후속 질문에 논리적·구체적으로 답변", 3: "답변하지만 깊이 부족", 2: "당황하거나 모호하게 답변", 1: "답변 불가" }
      },
      ai_distinction: {
        name: "AI와의 차별점",
        description: "AI 제안과 자기 결정의 차이를 설명하는가",
        levels: { 4: "AI 제안 vs 자기 결정을 구체적 사례로 설명", 3: "차이를 인식하나 사례가 부족", 2: "'AI가 해줬어요' 수준", 1: "AI 사용 여부 자체를 설명 못함" }
      },
      presentation: {
        name: "발표 태도",
        description: "자신감, 논리적 흐름, 시간 관리",
        levels: { 4: "자신감 있고 논리적 흐름이 명확", 3: "대체로 안정적이나 일부 흐름 끊김", 2: "긴장하여 내용 전달이 어려움", 1: "발표 준비 부족" }
      }
    }
  },

  p6_sharing: {
    name: "실천 6: 공유 실패 루틴",
    maxScore: 16,
    levelThresholds: { 탁월: 14, 우수: 10, 보통: 6 },
    teacherObservation: true,
    items: {
      failure_specificity: {
        name: "실패 사례 구체성",
        description: "무엇이 안 됐는지 구체적으로 공유하는가",
        levels: { 4: "코드/하드웨어 등 구체적 실패 상황 + 재현 조건 설명", 3: "실패 상황은 설명하나 재현 조건 부족", 2: "'안 됐어요' 수준", 1: "공유하지 않음" }
      },
      cause_analysis: {
        name: "원인 분석",
        description: "왜 안 됐는지 분석하는가",
        levels: { 4: "근본 원인을 분석하고 가설을 세움", 3: "원인을 추측하나 검증 부족", 2: "'모르겠어요' 수준", 1: "분석 시도 없음" }
      },
      discussion_contribution: {
        name: "토론 기여도",
        description: "다른 모둠의 실패에 건설적 피드백을 주는가",
        levels: { 4: "구체적 해결 아이디어나 유사 경험 공유", 3: "공감하며 간단한 의견 제시", 2: "듣기만 함", 1: "참여하지 않음" }
      },
      improvement_plan: {
        name: "개선 방안",
        description: "공유를 통해 얻은 개선 아이디어가 있는가",
        levels: { 4: "다른 모둠 피드백을 반영한 구체적 개선 계획", 3: "개선 방향은 있으나 구체성 부족", 2: "'다시 해볼게요' 수준", 1: "개선 계획 없음" }
      }
    }
  },

  p7_reflection: {
    name: "실천 7: 성장 성찰문",
    maxScore: 16,
    levelThresholds: { 탁월: 14, 우수: 10, 보통: 6 },
    items: {
      problem_finding_change: {
        name: "문제 발견 능력의 변화",
        description: "첫 정의서와 마지막 정의서를 구체적으로 인용하며 질적 변화를 분석하는지",
        levels: { 4: "첫/마지막 정의서를 날짜·원문 인용하며 질적 변화 분석", 3: "변화를 인식하나 구체적 인용 부족", 2: "'나아졌다' 수준", 1: "미작성 또는 '많이 배웠습니다'" }
      },
      ai_collaboration_change: {
        name: "AI 협업 방식의 변화",
        description: "일지 번호/날짜를 인용하며 초기→후기의 질적 전환을 분석하는지",
        levels: { 4: "일지 번호/날짜 인용하며 질적 전환 분석", 3: "변화를 인식하나 구체적 인용 부족", 2: "'AI를 더 잘 쓰게 되었다' 수준", 1: "'AI가 도움이 많이 되었습니다'" }
      },
      important_decision: {
        name: "가장 중요한 결정",
        description: "구체적 상황 + AI의 제안 + 자기 선택 + 선택 이유 + 결과까지 서술하는지",
        levels: { 4: "상황+AI 제안+자기 선택+이유+결과 모두 서술", 3: "결정과 이유는 있으나 비교/결과 부족", 2: "'잘 모르겠다'", 1: "미작성" }
      },
      self_understanding: {
        name: "자기 이해",
        description: "학기 동안 선택한 문제들의 패턴을 분석하고, 자신의 관심사와 진로까지 연결하는지",
        levels: { 4: "선택 패턴 분석 + 관심사 + 진로 연결", 3: "관심사는 인식하나 깊이 부족", 2: "'여러 가지에 관심이 있다'", 1: "미작성" }
      }
    }
  }
};

export default rubrics;
