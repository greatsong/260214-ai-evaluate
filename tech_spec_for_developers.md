# AI 기반 프로젝트 평가 시스템 — 개발자 기술 스펙

> 이 문서는 `ai_assessment_system_guide_v2.md`(교육 설계 문서)의 **기술 구현 스펙**입니다.
> 교육 도메인 지식(루브릭, 예시, 철학)은 가이드 문서를 참조하세요.
> 이 문서는 "어떻게 만들 것인가"에만 집중합니다.

---

## 1. 시스템 아키텍처

### 1.1 전체 구조

```
┌─────────────────────────────────────────────────┐
│                   Streamlit UI                    │
│  ┌───────────┬───────────┬───────────┬─────────┐ │
│  │ 개별 평가  │ 성장 분석  │ 포트폴리오 │ 학급 현황│ │
│  └─────┬─────┴─────┬─────┴─────┬─────┴────┬────┘ │
│        │           │           │          │       │
│  ┌─────▼───────────▼───────────▼──────────▼────┐  │
│  │              평가 엔진 (Python)               │  │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────┐ │  │
│  │  │루브릭 매칭│  │성장 비교  │  │피드백 생성  │ │  │
│  │  └────┬─────┘  └────┬─────┘  └─────┬──────┘ │  │
│  │       │             │              │         │  │
│  │  ┌────▼─────────────▼──────────────▼──────┐  │  │
│  │  │         Claude API (Sonnet 4)          │  │  │
│  │  │   시스템 프롬프트 + 루브릭 + Few-shot   │  │  │
│  │  └────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │              데이터 저장 (JSON/SQLite)         │  │
│  │  학생 정보 │ 산출물 원문 │ 평가 결과 │ 이력    │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 1.2 기술 스택

| 구성 요소 | 기술 | 이유 |
|----------|------|------|
| 프론트엔드 | Streamlit | 교사가 Python만으로 운영 가능 |
| AI 엔진 | Claude API (claude-sonnet-4-5-20250929) | 비용 효율 + 한국어 성능 |
| 데이터 저장 | SQLite (단일 파일) | 설치 불필요, 백업 간편 |
| 차트 | Plotly | Streamlit 내장 지원, 인터랙티브 |
| 배포 | Streamlit Community Cloud 또는 로컬 | 학교 환경 고려 |

### 1.3 왜 이 구조인가 (개발자가 알아야 할 맥락)

- **사용자는 교사 1인**: 동시 접속, 부하 분산 불필요. 단일 사용자 로컬 앱이면 충분.
- **데이터 규모**: 학급 30명 × 학기당 산출물 약 10건 = 최대 300건/학기. SQLite로 충분.
- **AI 호출 빈도**: 실시간이 아님. 교사가 산출물을 입력하고 "평가" 버튼을 눌렀을 때만 호출. 학기당 약 300-500회.
- **민감 데이터**: 학생 이름과 학습 기록 포함. 외부 서버 전송 최소화. Claude API 호출 시 학생 이름 제거(비식별화) 필요.

---

## 2. 데이터 모델

### 2.1 ERD

```
students
├── id (PK, auto)
├── name (text)
├── class_name (text, e.g. "1반")
├── number (int)
└── created_at (datetime)

artifacts
├── id (PK, auto)
├── student_id (FK → students.id)
├── practice_type (text, enum: p1_discomfort | p2_comparison | p3_definition | p4_ai_log | p7_reflection)
├── raw_text (text, 학생이 작성한 원문 전체)
├── structured_data (JSON, 파싱된 항목별 데이터)
├── date (date, 작성일)
├── session (text, nullable, e.g. "6차시")
├── sequence (int, 같은 타입 내 순서, 성장 분석용)
└── created_at (datetime)

evaluations
├── id (PK, auto)
├── artifact_id (FK → artifacts.id)
├── eval_type (text, enum: individual | growth | portfolio)
├── scores (JSON, 항목별 점수)
├── total_score (float)
├── feedback (text, AI가 생성한 피드백)
├── raw_api_response (text, 디버깅용 원본)
└── created_at (datetime)

growth_analyses
├── id (PK, auto)
├── student_id (FK → students.id)
├── practice_type (text)
├── artifact_ids (JSON, 비교 대상 artifact id 목록)
├── analysis (text, AI 성장 분석 결과)
├── trajectory (JSON, 항목별 점수 시계열)
└── created_at (datetime)
```

### 2.2 practice_type 상세

| practice_type | 한글명 | 항목 수 | 비고 |
|--------------|--------|---------|------|
| p1_discomfort | 불편함 수집 | 3항목 (구체성, 분류, 선택이유) | 학기 1회 |
| p2_comparison | AI 비교 | 3항목 (고유 발견, 비교 분석, 결정력) | 학기 1회 |
| p3_definition | 문제 정의서 | 7항목 (정의~결정이유) | 프로젝트당 1회, 학기 2-3회 |
| p4_ai_log | AI 활용 일지 | 5항목 (프롬프트~결정) | AI 사용 시마다, 학기 5-15건 |
| p7_reflection | 성장 성찰문 | 4항목 (문제발견~자기이해) | 학기 1회 |

### 2.3 structured_data JSON 형식 (practice_type별)

#### p3_definition

```json
{
  "problem": "4교시 종료(12:10)와 급식 시작(12:00)의...",
  "specifics": "매일 12:10에 급식실 도착하면...",
  "who": "1학년 8개 반(약 240명)...",
  "urgency": "매일 240명이 겪는...",
  "ai_says": "AI 답변 요약...",
  "ai_missing": "모바일 주문은 폰 사용 금지...",
  "my_reason": "데이터로 증명하는 것이..."
}
```

#### p4_ai_log

```json
{
  "prompt": "Pico W에서 DHT22...",
  "ai_response": "45줄 코드, ssd1306...",
  "my_changes": "1) SH1106 변경 2) try-except...",
  "ai_problems": "SSD1306/SH1106 혼동...",
  "my_decision": "28도 이상 경고 추가..."
}
```

#### p7_reflection

```json
{
  "area1_problem_finding": "첫 정의서: '급식 줄이 길다'...",
  "area2_ai_collaboration": "3월 일지: 'AI 코드 그대로'...",
  "area3_important_decision": "MQTT 브로커를 로컬로...",
  "area4_self_understanding": "데이터로 측정 가능한..."
}
```

---

## 3. Claude API 호출 스펙

### 3.1 공통 사항

- **모델**: `claude-sonnet-4-5-20250929`
- **max_tokens**: 2000 (개별 평가), 3000 (성장 분석), 4000 (포트폴리오)
- **temperature**: 0.3 (평가 일관성을 위해 낮게)
- **비식별화**: API 호출 전 학생 이름을 "학생A"로 치환. 응답 후 원래 이름으로 복원.

### 3.2 개별 산출물 평가 — API 호출 구조

#### 시스템 프롬프트 (practice_type에 따라 분기)

```python
SYSTEM_PROMPTS = {
    "p3_definition": """당신은 고등학교 AI/정보 수업의 평가 전문가입니다.

학생이 작성한 "문제 정의서"를 아래 루브릭에 따라 평가하세요.

## 루브릭 (항목별 1-4점)

### 항목 1: 문제 정의
- 4점 (탁월): 한 문장으로 명확하고, 측정 가능한 요소(숫자, 시간, 빈도 등) 포함
- 3점 (우수): 명확하지만 측정 가능 요소 부족
- 2점 (보통): 모호하지만 방향은 있음
- 1점 (미달): 매우 추상적 (예: "급식", "불편함")

### 항목 2: 구체성
- 4점: 시간, 장소, 빈도, 수치가 모두 포함 (예: "12:10 도착, 80-100명, 15분 대기")
- 3점: 일부 수치 포함 (예: "15분 정도 기다림")
- 2점: 서술적이나 수치 없음 (예: "오래 기다린다")
- 1점: 한 줄 미만 또는 미작성

### 항목 3: 대상 인식
- 4점: 영향 받는 사람의 범위와 특성 구체적 (예: "1학년 4층 5-8반 120명")
- 3점: 대상을 명시하나 구체성 부족 (예: "1학년 학생들")
- 2점: "학생들" 수준의 일반 언급
- 1점: 미작성 또는 "나"만 언급

### 항목 4: 긴급성
- 4점: 지속 시 구체적 결과를 논리적으로 서술 (예: "소화불량 → 오후 집중력 저하 → 성적 영향")
- 3점: 결과를 언급하나 논리적 연결 부족
- 2점: "불편하니까" 수준
- 1점: 미작성

### 항목 5: AI 활용
- 4점: AI 답변을 구체적으로 요약하고, 자신의 문제 맥락과 연결하여 서술
- 3점: 요약은 했으나 맥락 연결 부족
- 2점: AI 답변을 단순 복붙
- 1점: AI를 사용하지 않았거나 미기록

### 항목 6: 비판적 사고 (가장 중요한 항목)
- 4점: AI가 모르는 구체적 맥락(학교 규정, 시설 특성, 시간표 등) 2개 이상 + 왜 AI가 이걸 모르는지 설명
- 3점: 1개의 빈틈을 구체적으로 지적 + 설명
- 2점: "좀 다른 것 같다" 수준, 구체성 부족
- 1점: "없음" 또는 미작성

### 항목 7: 결정 이유
- 4점: 개인 경험, 가치관, 실현 가능성 등을 종합한 논리적 이유 (예: "내가 센서를 배우고 있어서 직접 만들 수 있고, 매일 겪는 문제라 동기부여도 확실")
- 3점: 이유가 있으나 한 측면만 (예: "매일 겪는 문제라서")
- 2점: "그냥 이게 좋아서", "급식은 매일 먹으니까"
- 1점: 미작성

## 출력 형식 (반드시 이 JSON 형식으로)

```json
{
  "scores": {
    "problem_definition": {"score": 3, "evidence": "측정 요소 없이 '줄이 길다'만 서술"},
    "specifics": {"score": 2, "evidence": "수치 없이 서술적"},
    "who": {"score": 3, "evidence": "'1학년 학생들'로 범위 명시하나 인원수 부재"},
    "urgency": {"score": 2, "evidence": "'불편하다' 수준의 서술"},
    "ai_usage": {"score": 3, "evidence": "요약은 했으나 자기 맥락과 미연결"},
    "critical_thinking": {"score": 3, "evidence": "학교 규정 1개 지적했으나 추가 맥락 부족"},
    "decision_reason": {"score": 2, "evidence": "'매일 겪으니까' 수준의 단면적 이유"}
  },
  "total_score": 18,
  "max_score": 28,
  "level": "우수",
  "feedback": {
    "praise": "...",
    "improvement": "...",
    "action_guide": "..."
  }
}
```

## 평가 시 주의사항

1. "비판적 사고(항목 6)"에 가중치를 두세요. 이 항목이 이 교육의 핵심입니다.
2. 점수는 반드시 evidence(근거)와 함께. 학생 텍스트에서 직접 인용하세요.
3. feedback.praise는 가장 높은 점수 항목에서, improvement는 가장 낮은 항목에서.
4. feedback.action_guide는 "구체적 행동"이어야 합니다. "더 구체적으로 쓰세요"(X) → "예: '몇 명이 영향 받는지' 숫자를 내일 점심에 세어보세요"(O)
5. level은 총점 기준: 25-28=탁월, 19-24=우수, 12-18=보통, 7-11=미달
""",

    "p4_ai_log": """당신은 고등학교 AI/정보 수업의 평가 전문가입니다.

학생이 작성한 "AI 활용 일지" 1건을 아래 루브릭에 따라 평가하세요.

## 루브릭 (항목별 1-4점)

### 항목 1: 프롬프트 구체성
- 4점: 맥락(어떤 프로젝트), 조건(핀 번호, 라이브러리, 환경), 원하는 출력 형태까지 명시
  예시: "Pico W에서 DHT22 센서(GP16)로 온습도를 SH1106 OLED(I2C, SDA=GP0)에 표시하는 MicroPython 코드"
- 3점: 구체적이나 일부 조건 누락 (예: "Pico에서 DHT22 읽어서 OLED에 표시하는 코드")
- 2점: "온도 센서 코드 써줘" 수준
- 1점: "코드" 또는 미기록

### 항목 2: AI 결과 요약
- 4점: 핵심 구조를 파악하여 요약 (예: "45줄, dht+ssd1306 import, Pin 설정, while 루프 2초 간격")
- 3점: 요약은 했으나 구조 파악 부족 (예: "전체 코드를 줬음, 라이브러리 사용")
- 2점: "코드 줬음" 수준
- 1점: 미기록

### 항목 3: 수정 내용
- 4점: 뭘 바꿨는지 + 왜 바꿨는지 + 기술적 근거 (예: "ssd1306→sh1106 변경. 이유: 우리 OLED 칩이 SH1106")
- 3점: 뭘 바꿨는지는 적었으나 이유 부족 (예: "라이브러리 변경함")
- 2점: "조금 바꿈" / "수정함"
- 1점: "안 바꿈" 또는 미기록

### 항목 4: AI 문제점 인식 (핵심 항목)
- 4점: 구조적 한계를 지적하고 우리 환경과 연결 (예: "AI는 SSD1306을 기본 가정. 우리 OLED는 SH1106이라 호환 안 됨 + 에러 처리 누락 + I2C 주소 하드코딩")
- 3점: 문제점 1개를 구체적으로 지적 (예: "OLED 라이브러리가 다름")
- 2점: "좀 이상함" / "안 맞는 부분 있었음"
- 1점: "없음" 또는 미기록

### 항목 5: 자기 결정
- 4점: 프로젝트 목적에 기반한 판단 + AI와 다른 선택의 근거 (예: "교실 환기 목적이므로 28도 경고 추가. 기준은 학교 냉방 규정 참고")
- 3점: 결정은 있으나 근거가 약함 (예: "경고 기능 추가하기로 함")
- 2점: "AI 따라함" / "그대로 씀"
- 1점: 미기록

## 출력 형식

```json
{
  "scores": {
    "prompt_specificity": {"score": 3, "evidence": "..."},
    "ai_response_summary": {"score": 2, "evidence": "..."},
    "modifications": {"score": 3, "evidence": "..."},
    "problem_recognition": {"score": 2, "evidence": "..."},
    "own_decision": {"score": 2, "evidence": "..."}
  },
  "total_score": 12,
  "max_score": 20,
  "level": "보통",
  "feedback": {
    "praise": "...",
    "improvement": "...",
    "action_guide": "..."
  }
}
```

## 주의사항

1. "AI 문제점 인식(항목 4)"이 이 교육의 핵심입니다. 가중치를 두세요.
2. 학생이 "없음"이라고 적었다면, 진짜 문제점이 없었을 가능성은 매우 낮습니다. AI 코드가 특정 환경에서 완벽하게 작동하는 경우는 거의 없으므로, "없음"은 대부분 인식 부족입니다.
3. action_guide는 반드시 구체적 행동을 제안하세요. "AI 코드를 실행하기 전에, 우리 키트의 OLED가 SSD1306인지 SH1106인지 먼저 확인해보세요"처럼.
4. level: 17-20=탁월, 13-16=우수, 8-12=보통, 5-7=미달
""",

    "p7_reflection": """당신은 고등학교 AI/정보 수업의 평가 전문가입니다.

학생이 작성한 "성장 성찰문"을 아래 루브릭에 따라 평가하세요.

## 루브릭 (영역별 1-4점)

### 영역 1: 문제 발견 능력의 변화
- 4점: 첫 정의서와 마지막 정의서를 구체적으로 인용(날짜, 원문)하며 질적 변화를 분석
  예시: "3월 5일: '급식 줄이 길다' → 5월 20일: '12:10 종료, 240명, 15분 대기'. 숫자가 생겼고 '모호한 불만'이 '측정 가능한 문제'가 되었다."
- 3점: 변화를 인식하나 구체적 인용 부족 (예: "처음보다 구체적으로 적게 되었다")
- 2점: "나아졌다" 수준
- 1점: 미작성 또는 "많이 배웠습니다"

### 영역 2: AI 협업 방식의 변화
- 4점: 일지 번호/날짜를 인용하며 초기→후기의 질적 전환을 분석
  예시: "3월 일지#1: 'AI 코드 그대로 씀' → 5월 일지#8: '보안 위험 3가지 지적, 라이브러리 변경'. 3월에는 '받았고' 5월에는 '검토했다'."
- 3점: 변화를 인식하나 구체적 인용 부족
- 2점: "AI를 더 잘 쓰게 되었다" 수준
- 1점: "AI가 도움이 많이 되었습니다"

### 영역 3: 가장 중요한 결정
- 4점: 구체적 상황 + AI의 제안 + 자기 선택 + 선택 이유 + 결과까지 서술
  예시: "AI가 공개 서버 제안 → 학교 네트워크 불안정 고려 → 로컬 브로커 선택 → 발표 당일 성공"
- 3점: 결정과 이유는 있으나 AI 제안과의 비교 또는 결과가 부족
- 2점: "잘 모르겠다"
- 1점: 미작성

### 영역 4: 자기 이해
- 4점: 학기 동안 선택한 문제들의 패턴을 분석하고, 자신의 관심사와 진로까지 연결
  예시: "급식 대기, 교실 온습도, Wi-Fi 문제 → 공통점: 데이터 측정 가능한 현실 문제 → IoT/데이터 분석 진로"
- 3점: 관심사는 인식하나 깊이 부족
- 2점: "여러 가지에 관심이 있다"
- 1점: 미작성

## 출력 형식

```json
{
  "scores": {
    "problem_finding_change": {"score": 3, "evidence": "..."},
    "ai_collaboration_change": {"score": 2, "evidence": "..."},
    "important_decision": {"score": 3, "evidence": "..."},
    "self_understanding": {"score": 2, "evidence": "..."}
  },
  "total_score": 10,
  "max_score": 16,
  "level": "보통",
  "feedback": {
    "praise": "...",
    "improvement": "...",
    "action_guide": "..."
  }
}
```

## 주의사항

1. "근거 기반" 여부가 핵심입니다. 날짜, 일지 번호, 원문 인용이 있으면 높은 점수.
2. "많이 배웠습니다", "열심히 했습니다" 같은 구체성 없는 서술은 1-2점.
3. 학생이 AI에게 성찰문을 대필시켰을 가능성 징후: 지나치게 매끄럽고 일반적인 서술, 구체적 날짜/일지 인용 없음, 학생 고유의 경험이 아닌 일반론. 이 경우 피드백에서 "구체적 일지를 인용하면 더 좋겠다"고 안내.
4. level: 14-16=탁월, 10-13=우수, 6-9=보통, 4-5=미달
"""
}
```

### 3.3 성장 분석 — API 호출 구조

#### 시스템 프롬프트

```python
GROWTH_SYSTEM_PROMPT = """당신은 학생의 AI 활용 역량 성장을 분석하는 전문가입니다.

같은 학생이 시간 순서로 작성한 AI 활용 일지 여러 건을 받습니다.
각 일지를 개별 평가한 후, 시간에 따른 변화를 분석하세요.

## 분석 관점

1. **프롬프트 진화**: 초기("코드 써줘") → 후기(맥락+조건+형태 명시)로의 변화
2. **비판적 사고 성장**: "문제 없음" → 구체적 한계 지적으로의 변화
3. **결정력 발달**: "AI 따라함" → 목적 기반 독자적 판단으로의 변화
4. **기술적 이해 깊이**: 표면적 수정 → 구조적 이해 기반 수정으로의 변화

## 출력 형식

```json
{
  "individual_scores": [
    {"date": "2026-03-25", "session": "3차시", "scores": {...}, "total": 5},
    {"date": "2026-04-08", "session": "6차시", "scores": {...}, "total": 14},
    {"date": "2026-05-15", "session": "12차시", "scores": {...}, "total": 19}
  ],
  "trajectory": {
    "prompt_specificity": [1, 3, 4],
    "ai_response_summary": [1, 3, 4],
    "modifications": [1, 3, 4],
    "problem_recognition": [1, 2, 4],
    "own_decision": [1, 3, 4]
  },
  "growth_narrative": "이 학생은 3월에는 AI를 '답을 주는 도구'로 사용했지만, 5월에는 '검토하고 개선할 대상'으로 인식이 전환되었습니다. 특히 ...",
  "strongest_growth": "problem_recognition",
  "needs_attention": "없음 (모든 영역에서 유의미한 성장)",
  "teacher_recommendation": "이 학생의 5월 일지를 학급 우수 사례로 공유할 것을 권장합니다."
}
```
"""
```

#### 유저 메시지 구성

```python
def build_growth_message(logs: list[dict]) -> str:
    msg = "다음은 같은 학생의 AI 활용 일지를 시간 순서로 나열한 것입니다.\n\n"
    for i, log in enumerate(logs):
        msg += f"=== 일지 #{i+1} ({log['date']}, {log['session']}) ===\n"
        msg += f"AI에게 뭘 물었나?: {log['prompt']}\n"
        msg += f"AI가 뭘 줬나?: {log['ai_response']}\n"
        msg += f"내가 뭘 바꿨나?: {log['my_changes']}\n"
        msg += f"AI 답변의 문제점?: {log['ai_problems']}\n"
        msg += f"내가 결정한 것은?: {log['my_decision']}\n\n"
    msg += "위 일지들을 시간 순서로 분석하고, 성장 궤적을 평가해주세요."
    return msg
```

### 3.4 포트폴리오 종합 평가 — API 호출 구조

```python
PORTFOLIO_SYSTEM_PROMPT = """당신은 학기 전체의 학생 역량을 종합 평가하는 전문가입니다.

학생의 학기 전체 산출물(불편함 수집, AI 비교, 문제 정의서, AI 활용 일지들, 성장 성찰문)을 받습니다.

## FACT 프레임워크로 종합

- F (Fundamental, 기초): 문제 정의서의 구체성, AI 활용 일지의 기술적 이해 수준
- A (Applied, 적용): AI 활용 일지에서의 AI 협업 과정, 프롬프트 설계 능력
- C (Conceptual, 개념): 문제 정의서의 원인 분석, 성찰문의 변화 인식 깊이
- T (Thinking, 사고): 비판적 사고(AI 빈틈 발견), 결정력(자기 판단), 자기 이해

## 출력 형식

```json
{
  "fact_scores": {
    "F": {"score": 3.5, "evidence": "문제 정의 구체성 4점, AI 일지 기술 이해 3점 평균"},
    "A": {"score": 3.0, "evidence": "프롬프트 진화 확인, 후반 AI 협업 수준 높음"},
    "C": {"score": 3.5, "evidence": "성찰문에서 질적 변화 구조적 분석"},
    "T": {"score": 4.0, "evidence": "AI 빈틈 발견 우수, 독자적 판단 일관적"}
  },
  "overall_level": "우수",
  "strengths": ["비판적 사고(T)가 가장 강함", "시간에 따른 뚜렷한 성장"],
  "growth_areas": ["기초(F) 영역에서 개념 설명 능력 보강 필요"],
  "portfolio_narrative": "이 학생은 학기 동안...",
  "생기부_초안": "AI 기반 프로젝트 수업에서 문제 발견부터 해결까지의 전 과정을 주도적으로 수행함. 특히 AI가 제안한 코드의 구조적 한계(라이브러리 호환성, 네트워크 환경 차이)를 스스로 발견하고 수정하는 비판적 사고 능력이 돋보임. 학기 초 '급식 줄이 길다'는 모호한 불만에서 출발하여, 학기 말에는 '시간표와 급식 시간의 10분 차이로 인한 240명의 대기 문제'를 데이터 기반으로 정의하는 수준까지 성장함. IoT 센서를 활용한 교실 환경 모니터링 프로젝트에서 AI의 일반적 제안을 학교 환경에 맞게 재설계하는 판단력을 보여줌."
}
```

## 생기부 초안 작성 원칙

1. 구체적 행동과 결과 중심 (추상적 역량 나열 금지)
2. 학생의 성장 궤적을 포함 (초기→후기)
3. AI 활용의 비판적 측면을 강조 (단순 활용이 아닌 판단)
4. 200-400자 내외
5. "~함", "~보임" 체로 마무리 (학교생활기록부 문체)
"""
```

### 3.5 응답 파싱 — 핵심 주의사항

```python
import json
import re

def parse_ai_response(response_text: str) -> dict:
    """Claude 응답에서 JSON을 추출하는 함수.
    
    Claude가 JSON 앞뒤에 설명 텍스트를 붙이는 경우가 있으므로,
    ```json ... ``` 블록 또는 첫 번째 { ... } 블록을 추출.
    """
    # 방법 1: ```json 블록 추출
    json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass
    
    # 방법 2: 첫 번째 { ... } 블록 추출 (중첩 고려)
    depth = 0
    start = -1
    for i, ch in enumerate(response_text):
        if ch == '{':
            if depth == 0:
                start = i
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0 and start >= 0:
                try:
                    return json.loads(response_text[start:i+1])
                except json.JSONDecodeError:
                    pass
    
    # 파싱 실패 시 에러 처리
    return {"error": "JSON 파싱 실패", "raw": response_text}


def validate_scores(result: dict, practice_type: str) -> dict:
    """점수가 루브릭 범위(1-4) 안에 있는지 검증하고, 총점을 재계산."""
    
    expected_fields = {
        "p3_definition": ["problem_definition", "specifics", "who", "urgency", 
                          "ai_usage", "critical_thinking", "decision_reason"],
        "p4_ai_log": ["prompt_specificity", "ai_response_summary", "modifications",
                      "problem_recognition", "own_decision"],
        "p7_reflection": ["problem_finding_change", "ai_collaboration_change",
                          "important_decision", "self_understanding"]
    }
    
    fields = expected_fields.get(practice_type, [])
    scores = result.get("scores", {})
    
    total = 0
    for field in fields:
        if field in scores:
            s = scores[field].get("score", 0)
            s = max(1, min(4, int(s)))  # 1-4 범위로 클램프
            scores[field]["score"] = s
            total += s
        else:
            scores[field] = {"score": 0, "evidence": "평가 누락"}
    
    result["scores"] = scores
    result["total_score"] = total
    result["max_score"] = len(fields) * 4
    
    # level 재계산
    ratio = total / (len(fields) * 4)
    if ratio >= 0.875:
        result["level"] = "탁월"
    elif ratio >= 0.625:
        result["level"] = "우수"
    elif ratio >= 0.375:
        result["level"] = "보통"
    else:
        result["level"] = "미달"
    
    return result
```

---

## 4. Streamlit UI 스펙

### 4.1 페이지 구조

```
📊 AI 교실 평가 시스템
├── 📝 학생 관리 (sidebar)
│   ├── 학생 추가/삭제
│   └── 학급 선택 드롭다운
│
├── [Tab 1] 개별 평가
│   ├── practice_type 선택 (라디오 버튼)
│   ├── 학생 선택 (드롭다운)
│   ├── 산출물 입력 (text_area, 또는 항목별 개별 입력)
│   ├── [평가하기] 버튼
│   └── 결과 표시 (점수 테이블 + 레이더 차트 + 피드백)
│
├── [Tab 2] 성장 분석
│   ├── 학생 선택
│   ├── 해당 학생의 AI 활용 일지 목록 표시
│   ├── [성장 분석] 버튼
│   └── 결과 표시 (항목별 꺾은선 그래프 + 성장 서술)
│
├── [Tab 3] 포트폴리오
│   ├── 학생 선택
│   ├── 학기 전체 산출물 요약 표시
│   ├── [종합 평가] 버튼
│   └── 결과 표시 (FACT 레이더 차트 + 서술 + 생기부 초안)
│
└── [Tab 4] 학급 현황
    ├── 학급 전체 학생의 실천별 점수 히트맵
    ├── 항목별 평균/분포
    └── 성장률 상위/하위 학생 목록
```

### 4.2 입력 UI 상세 — 문제 정의서 (p3)

이것이 개발자가 가장 고민할 부분입니다. 학생 산출물을 어떻게 입력받을 것인가.

#### 방법 A: 전문 텍스트 한 번에 (추천)

```python
st.subheader("문제 정의서 입력")
raw_text = st.text_area(
    "학생이 작성한 문제 정의서 전체를 붙여넣으세요",
    height=400,
    placeholder="""1. 문제는 무엇인가?
4교시 종료(12:10)와 급식 시작(12:00)의 10분 차이로...

2. 구체적으로 설명하면?
매일 12:10에 급식실에 도착하면...

(이하 7개 항목)"""
)
```

이유: 교사가 학생 활동지를 사진 찍거나, 학생이 디지털로 제출한 것을 그대로 복붙하는 게 가장 현실적.

#### 방법 B: 항목별 개별 입력 (정확도 높지만 번거로움)

```python
with st.expander("문제 정의서 항목별 입력"):
    field1 = st.text_area("1. 문제는 무엇인가?", height=80)
    field2 = st.text_area("2. 구체적으로 설명하면?", height=100)
    # ... 7개 항목
```

#### 추천: 방법 A + 자동 파싱

Claude에게 원문 텍스트를 보내면서, 시스템 프롬프트에 "먼저 7개 항목을 추출한 후 각 항목을 평가하라"고 지시. 자동 파싱과 평가를 한 번의 API 호출로 처리.

```python
# 유저 메시지에 원문을 그대로 전달
user_message = f"""다음은 학생이 작성한 문제 정의서입니다.
7개 항목(문제 정의, 구체성, 대상, 긴급성, AI 활용, 비판적 사고, 결정 이유)을
텍스트에서 추출한 후, 각 항목을 루브릭에 따라 평가하세요.

---
{raw_text}
---
"""
```

### 4.3 결과 표시 UI

#### 레이더 차트 (Plotly)

```python
import plotly.graph_objects as go

def create_radar_chart(scores: dict, title: str):
    categories = list(scores.keys())
    values = [s["score"] for s in scores.values()]
    
    fig = go.Figure(data=go.Scatterpolar(
        r=values + [values[0]],  # 닫힌 도형
        theta=categories + [categories[0]],
        fill='toself',
        fillcolor='rgba(46, 117, 182, 0.3)',
        line=dict(color='#2E75B6')
    ))
    fig.update_layout(
        polar=dict(radialaxis=dict(range=[0, 4], tickvals=[1,2,3,4])),
        title=title,
        height=400
    )
    return fig
```

#### 성장 추이 꺾은선 그래프

```python
def create_growth_chart(trajectory: dict, dates: list):
    fig = go.Figure()
    for item, values in trajectory.items():
        fig.add_trace(go.Scatter(
            x=dates, y=values,
            mode='lines+markers',
            name=item
        ))
    fig.update_layout(
        yaxis=dict(range=[0, 4.5], tickvals=[1,2,3,4],
                   ticktext=["미달","보통","우수","탁월"]),
        title="AI 활용 역량 성장 추이",
        height=400
    )
    return fig
```

#### 피드백 카드

```python
def display_feedback(feedback: dict):
    st.success(f"👍 **잘한 점**: {feedback['praise']}")
    st.info(f"📈 **더 성장하려면**: {feedback['improvement']}")
    st.warning(f"🎯 **구체적 행동 가이드**: {feedback['action_guide']}")
```

---

## 5. 비식별화 처리

### 5.1 왜 필요한가

학생의 이름, 반, 번호는 개인정보입니다. Claude API에 전송할 때 실명을 포함하면 안 됩니다.

### 5.2 구현

```python
import re

def anonymize(text: str, student_name: str) -> str:
    """학생 이름을 '학생'으로 치환"""
    return text.replace(student_name, "학생")

def deanonymize(text: str, student_name: str) -> str:
    """'학생'을 실명으로 복원 (피드백 표시 시)"""
    return text.replace("학생", student_name)
```

### 5.3 API 호출 시 적용

```python
# 평가 요청 시
anonymized_text = anonymize(raw_text, student.name)
response = call_claude_api(anonymized_text)

# 결과 저장 시 (DB에는 비식별화된 상태로)
evaluation.feedback = response["feedback"]

# 화면 표시 시 (UI에서만 복원)
display_feedback = deanonymize(evaluation.feedback, student.name)
```

---

## 6. 에러 처리 및 엣지 케이스

### 6.1 API 호출 실패

```python
import time

def call_claude_with_retry(messages, system, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = client.messages.create(
                model="claude-sonnet-4-5-20250929",
                max_tokens=2000,
                temperature=0.3,
                system=system,
                messages=messages
            )
            return response.content[0].text
        except anthropic.RateLimitError:
            wait = 2 ** attempt * 10
            st.warning(f"API 호출 제한. {wait}초 후 재시도...")
            time.sleep(wait)
        except anthropic.APIError as e:
            st.error(f"API 오류: {e}")
            return None
    st.error("API 호출 실패. 나중에 다시 시도하세요.")
    return None
```

### 6.2 빈 입력 / 미작성 항목 처리

```python
def precheck_input(raw_text: str, practice_type: str) -> tuple[bool, str]:
    """입력 텍스트가 평가 가능한 상태인지 사전 검증"""
    
    if not raw_text or len(raw_text.strip()) < 10:
        return False, "입력이 너무 짧습니다. 학생 산출물을 붙여넣어주세요."
    
    if practice_type == "p3_definition":
        # 최소 3개 항목이 있는지 확인 (완전 미작성 방지)
        markers = ["문제", "구체", "누구", "왜", "AI", "빠진", "이유"]
        found = sum(1 for m in markers if m in raw_text)
        if found < 2:
            return False, "문제 정의서 형식이 아닌 것 같습니다. 7개 항목이 포함되었는지 확인해주세요."
    
    return True, "OK"
```

### 6.3 Claude가 JSON 형식을 따르지 않는 경우

```python
def evaluate_with_fallback(raw_text, practice_type):
    """1차 시도 실패 시, 더 엄격한 프롬프트로 재시도"""
    
    result_text = call_claude_with_retry(
        messages=[{"role": "user", "content": raw_text}],
        system=SYSTEM_PROMPTS[practice_type]
    )
    
    parsed = parse_ai_response(result_text)
    
    if "error" in parsed:
        # 재시도: JSON만 출력하라고 강조
        retry_msg = f"""이전 응답이 JSON 형식이 아니었습니다. 
반드시 유효한 JSON만 출력하세요. 설명 텍스트 없이 JSON만.

원본 텍스트:
{raw_text}"""
        
        result_text = call_claude_with_retry(
            messages=[{"role": "user", "content": retry_msg}],
            system=SYSTEM_PROMPTS[practice_type] + "\n\n중요: 반드시 JSON만 출력하세요. 다른 텍스트 없이."
        )
        parsed = parse_ai_response(result_text)
    
    if "error" not in parsed:
        parsed = validate_scores(parsed, practice_type)
    
    return parsed
```

---

## 7. 생기부 서술 생성 상세

### 7.1 개발자가 알아야 할 맥락

"생기부"(학교생활기록부)는 한국 고등학교에서 학생의 수업 활동을 기록하는 공식 문서입니다. 대학 입시에 매우 중요합니다.

생기부 서술의 제약:

| 제약 | 내용 |
|------|------|
| 분량 | 과목당 500자 내외 (학교마다 다름) |
| 문체 | "~함", "~보임", "~나타남" (3인칭 관찰자 시점) |
| 금지 사항 | 다른 학생과의 비교 금지, 순위 언급 금지, 교외 활동 언급 금지 |
| 포함해야 할 것 | 구체적 활동 내용 + 역량/태도 + 성장 |

### 7.2 생기부 생성 프롬프트

```python
SEUNGGIBOO_SYSTEM_PROMPT = """당신은 한국 고등학교 학교생활기록부(생기부) 서술 전문가입니다.

학생의 학기 평가 결과를 바탕으로 생기부 "세부능력 및 특기사항" 서술을 작성하세요.

## 작성 규칙

1. 문체: "~함", "~보임", "~나타남" (3인칭 관찰자 시점)
2. 분량: 300-500자
3. 구조: [구체적 활동] + [역량/성장] + [향후 가능성]
4. 금지: 다른 학생과 비교, 순위, 교외 활동, "1등", "최고" 등의 서열 표현
5. 필수: 구체적 프로젝트명, 구체적 행동, 구체적 결과
6. AI 관련 표현: "AI 도구를 활용하여"가 아니라 "AI가 제안한 코드의 한계를 인식하고 학교 환경에 맞게 재설계하는" 등 비판적 활용을 강조

## 입력

학생의 FACT 종합 평가, 강점, 성장 영역, 포트폴리오 서술이 제공됩니다.

## 출력

생기부 서술문 1개 (300-500자). 다른 설명 없이 서술문만 출력하세요.
"""
```

### 7.3 생기부 예시 (few-shot용)

```
예시 1 (탁월 학생):
"AI 기반 프로젝트 수업에서 일상의 불편함을 데이터 기반의 구체적 문제로 정의하는 역량이 돋보임. '급식 대기 시간 문제'를 정의할 때 시간표와 급식 시간의 10분 차이, 영향 받는 학생 수(240명), 평균 대기 시간(15분) 등 정량적 요소를 포함하여 분석함. Raspberry Pi Pico W를 활용한 교실 환경 모니터링 시스템 구축 시, AI가 제안한 코드의 라이브러리 호환성 문제와 학교 네트워크 환경의 특수성을 스스로 파악하여 수정하는 비판적 사고 능력을 보임. 학기 초 AI 코드를 수정 없이 사용하던 단계에서, 학기 말에는 보안 위험과 구조적 한계를 지적하며 독자적 대안을 제시하는 수준까지 성장함. 데이터로 측정 가능한 현실 문제에 관심을 보이며 IoT와 데이터 분석 분야의 잠재력이 기대됨."

예시 2 (우수 학생):
"문제 정의 능력에서 학기 동안 뚜렷한 성장을 보임. 학기 초 '교실이 덥다'는 모호한 불만에서 출발하여, 학기 말에는 시간대별 온도 변화 패턴과 영향을 구체적으로 서술하는 단계까지 발전함. AI 활용 프로젝트에서 AI가 제안한 코드의 OLED 디스플레이 호환성 문제를 발견하고 적합한 라이브러리로 교체하는 등 기술적 판단력을 보임. 프로젝트 발표 시 자신의 작업 과정을 논리적으로 설명하며, AI가 수행한 부분과 자신이 판단한 부분을 명확히 구분하여 설명하는 메타인지 능력을 나타냄."
```

---

## 8. 테스트 계획

### 8.1 테스트 데이터

가이드 문서(`ai_assessment_system_guide_v2.md`)에 포함된 4수준(탁월/우수/보통/미달) 예시를 테스트 데이터로 사용하세요.

| 테스트 케이스 | 입력 | 기대 결과 |
|-------------|------|----------|
| p3_탁월 | 가이드 문서의 탁월(4점) 전체 예시 | total 25-28, level "탁월" |
| p3_우수 | 가이드 문서의 우수(3점) 전체 예시 | total 19-24, level "우수" |
| p3_보통 | 가이드 문서의 보통(2점) 전체 예시 | total 12-18, level "보통" |
| p3_미달 | 가이드 문서의 미달(1점) 전체 예시 | total 7-11, level "미달" |
| p4_탁월 | 가이드 문서의 탁월(4점) 단일 일지 | total 17-20, level "탁월" |
| p4_미달 | 가이드 문서의 미달(1점) 단일 일지 | total 5-7, level "미달" |
| 성장분석 | 가이드 문서의 3월→4월→5월 시계열 | strongest_growth 존재, 궤적 상승 |
| 빈 입력 | "" | 에러 메시지, API 호출 안 함 |
| 초짧은 입력 | "급식" | precheck 실패 |

### 8.2 평가 일관성 테스트

같은 입력에 대해 3회 호출하여 점수 편차 확인. temperature=0.3이면 대부분 ±1점 이내.

```python
def consistency_test(raw_text, practice_type, n=3):
    results = []
    for _ in range(n):
        r = evaluate_with_fallback(raw_text, practice_type)
        results.append(r["total_score"])
    
    avg = sum(results) / n
    spread = max(results) - min(results)
    print(f"평균: {avg:.1f}, 편차: {spread}")
    assert spread <= 3, f"편차가 너무 큼: {spread}"
```

---

## 9. 배포 및 운영

### 9.1 환경 변수

```
ANTHROPIC_API_KEY=sk-ant-...
DB_PATH=./data/assessments.db
```

### 9.2 requirements.txt

```
streamlit>=1.30.0
anthropic>=0.40.0
plotly>=5.18.0
pandas>=2.1.0
```

### 9.3 실행

```bash
streamlit run app.py
```

### 9.4 비용 추정

| 시나리오 | API 호출 | 예상 비용/학기 |
|---------|---------|--------------|
| 학급 30명, 산출물 10건씩 | 300회 개별평가 + 30회 성장분석 + 30회 포트폴리오 | 약 $5-10 |
| 학급 3개(90명) | 위의 3배 | 약 $15-30 |

Sonnet 기준, 입력 약 2000토큰 + 출력 약 1000토큰 = 호출당 약 $0.01-0.02

---

## 10. 확장 가능성 (v2 이후)

| 기능 | 설명 | 우선순위 |
|------|------|---------|
| OCR 입력 | 손글씨 활동지 사진 → 텍스트 변환 | 높음 |
| 학생 자기 평가 | 학생이 직접 자기 산출물을 입력하고 피드백 받기 | 중간 |
| 다년도 추적 | 1학년→2학년→3학년 성장 궤적 | 낮음 |
| 교사 간 공유 | 여러 교사의 평가 데이터 통합 | 낮음 |
