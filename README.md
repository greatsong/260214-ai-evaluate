# AI 교실 실천 평가 시스템 v2.0

> **배포 URL**: https://frontend-next-77o4bdy96-greatsongs-projects.vercel.app

고등학교 AI·정보 교과에서 학생들의 **실천 활동 산출물**을 Claude AI로 평가하고, 성장 과정을 추적하며, 생기부 초안까지 생성하는 교사용 평가 지원 시스템입니다.

---

## 주요 기능

### 1. 개별 평가 (루브릭 기반)
- 5가지 실천 유형별 상세 루브릭 (총 22개 평가 항목)
- 항목별 1~4점 채점 + 근거(evidence) 인용 + 피드백
- 수준 판정: 탁월 / 우수 / 보통 / 미달
- 레이더 차트로 시각화

### 2. 성장 분석
- 동일 실천 활동의 복수 산출물을 시간순 비교
- 항목별 꺾은선 그래프로 성장 추이 시각화
- 4가지 관점 분석: 구체성, 비판적 사고, 결정력, 기술적 이해

### 3. 포트폴리오 종합 평가 (FACT 프레임워크)
- **F**easibility (실현력) / **A**I literacy (AI 리터러시) / **C**ritical thinking (비판적 사고) / **T**eamwork (협업·소통)
- FACT 4축 레이더 차트 + 종합 서술

### 4. 생기부 초안 생성
- 300~500자, "~함/~보임" 문체
- 학교생활기록부 작성 규칙 준수
- 복사 가능한 텍스트 박스 제공

### 5. 학급 현황
- 학생 × 실천 유형 히트맵
- 학급 전체 평균/분포 통계

---

## 실천 유형별 평가 항목

| 실천 유형 | 항목 수 | 만점 | 평가 항목 |
|---|---|---|---|
| **실천 1**: 불편함 수집 | 3 | 12 | 구체성, 분류 적절성, 선택 이유 깊이 |
| **실천 2**: AI와 비교하기 | 3 | 12 | 나만 찾은 것의 질, 비교 분석 깊이, 결정력 |
| **실천 3**: 문제 정의서 | 7 | 28 | 문제 정의, 구체성, 대상 인식, 긴급성, AI 활용, 비판적 사고, 결정 이유 |
| **실천 4**: AI 활용 일지 | 5 | 20 | 프롬프트 구체성, AI 결과 요약, 수정 내용, 문제점 인식, 자기 결정 |
| **실천 7**: 성장 성찰문 | 4 | 16 | 문제 발견 변화, AI 협업 변화, 중요한 결정, 자기 이해 |

---

## 기술 스택

| 구분 | 기술 |
|---|---|
| 프론트엔드 | Next.js 14 (App Router), Tailwind CSS, Recharts |
| 백엔드 (로컬) | Express.js, SQLite3 |
| 백엔드 (Vercel) | Next.js API Routes (서버리스) |
| AI 평가 | Anthropic Claude API (`claude-sonnet-4-20250514`) |

---

## 프로젝트 구조

```
260214-ai-evaluate/
├── backend/                    # Express 백엔드 (로컬 전용)
│   ├── server.js               # Express 서버 + API 라우트
│   ├── services/
│   │   └── evaluationEngine.js # Claude API 평가 엔진
│   ├── data/
│   │   └── rubrics.js          # 평가 루브릭 데이터
│   └── .env.example            # 환경변수 예시
│
├── frontend-next/              # Next.js 프론트엔드 (로컬 + Vercel)
│   ├── app/
│   │   ├── layout.js           # 사이드바 레이아웃 + 데모 모드
│   │   ├── page.js             # 대시보드
│   │   ├── students/page.js    # 학생 관리
│   │   ├── artifacts/page.js   # 산출물 입력
│   │   ├── evaluate/page.js    # 개별 평가 (레이더 차트)
│   │   ├── growth/page.js      # 성장 분석 (꺾은선 그래프)
│   │   ├── portfolio/page.js   # 포트폴리오 (FACT + 생기부)
│   │   ├── class/page.js       # 학급 현황 (히트맵)
│   │   └── api/                # Vercel API Routes
│   │       ├── evaluate/route.js
│   │       ├── growth-analysis/route.js
│   │       ├── portfolio-feedback/route.js
│   │       ├── school-record/route.js
│   │       ├── rubrics/route.js
│   │       └── health/route.js
│   ├── components/
│   │   ├── Charts.js           # 레이더/FACT/꺾은선 차트
│   │   ├── ScoreTable.js       # 점수 테이블
│   │   ├── FeedbackCard.js     # 피드백 카드
│   │   └── LevelBadge.js       # 수준 뱃지
│   ├── lib/
│   │   ├── api.js              # API 호출 + 데모 모드
│   │   ├── demoData.js         # 데모 샘플 데이터
│   │   ├── rubrics.js          # 루브릭 (ES 모듈)
│   │   ├── evaluationEngine.js # 평가 엔진 (ES 모듈)
│   │   └── constants.js        # 상수 정의
│   ├── vercel.json             # Vercel 배포 설정
│   └── package.json
│
├── start.sh                    # 로컬 통합 실행 스크립트
├── ai_assessment_system_guide_v2.md   # 평가 가이드 스펙
└── tech_spec_for_developers.md        # 기술 스펙 문서
```

---

## 시작하기

### 방법 1: 로컬 실행 (Express + Next.js)

데이터가 SQLite에 영구 저장됩니다. 학생/산출물 관리 포함 모든 기능 사용 가능.

#### 사전 요구사항
- Node.js 18 이상
- npm

#### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/greatsong/260214-ai-evaluate.git
cd 260214-ai-evaluate

# 2. 백엔드 환경변수 설정
cp backend/.env.example backend/.env
# backend/.env 파일을 열고 실제 Anthropic API 키 입력:
# ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# 3. 통합 실행
chmod +x start.sh
./start.sh
```

실행 후:
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:5001/api

#### 수동 실행 (터미널 2개)

```bash
# 터미널 1: 백엔드
cd backend
npm install
npm start

# 터미널 2: 프론트엔드
cd frontend-next
npm install
npm run dev
```

---

### 방법 2: Vercel 배포 (서버리스)

별도 백엔드 서버 없이 Vercel에서 바로 실행됩니다. AI 평가 기능은 Next.js API Routes로 동작합니다.

> **참고**: Vercel 버전에서는 데이터베이스가 없으므로, 학생/산출물 데이터는 **데모 모드**(클라이언트 메모리)로 동작합니다. AI 평가/성장분석/포트폴리오/생기부 API는 실제 Claude API를 호출하여 정상 작동합니다.

#### 배포 단계

1. 이 저장소를 GitHub에 push
2. [vercel.com](https://vercel.com)에서 **New Project** → GitHub 저장소 연결
3. 설정:
   - **Root Directory**: `frontend-next`
   - **Framework Preset**: Next.js (자동 감지)
4. **Environment Variables** 추가:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-api03-your-key-here`
5. **Deploy** 클릭

#### Vercel CLI로 배포

```bash
cd frontend-next
npm i -g vercel
vercel login
vercel --prod
# 환경변수 설정은 Vercel 대시보드 → Settings → Environment Variables
```

---

## 데모 모드

처음 접속하면 **데모 모드 ON** 상태로, 샘플 데이터로 전체 기능을 체험할 수 있습니다.

- 5명의 샘플 학생 (김민준, 이서연, 박지호, 최수아, 정예준)
- 11개 산출물 (실천 1~7)
- 7개 평가 결과 (레이더 차트 + 피드백)
- 성장 분석 예시 (점수 변화 그래프)
- FACT 포트폴리오 예시
- 생기부 초안 예시

사이드바의 **데모 ON/OFF** 버튼으로 전환합니다.

---

## 평가 엔진 상세

### AI 평가 프로세스

```
학생 산출물 입력
    ↓
비식별화 (학생 이름 → "학생")
    ↓
입력 사전 검증 (최소 10자, 유효한 실천 유형)
    ↓
시스템 프롬프트 생성 (루브릭 + JSON 출력 형식)
    ↓
Claude API 호출 (temperature: 0.3)
    ↓
JSON 파싱 (코드블록 → 중첩 괄호 매칭)
    ↓ (실패 시 최대 3회 재시도, 지수 백오프)
점수 검증 (1-4 범위 클램프 + 총점 재계산)
    ↓
수준 판정 (탁월/우수/보통/미달)
    ↓
결과 반환 (scores + evidence + feedback)
```

### API 엔드포인트

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/api/evaluate` | 개별 산출물 평가 |
| POST | `/api/growth-analysis` | 성장 분석 |
| POST | `/api/portfolio-feedback` | FACT 포트폴리오 평가 |
| POST | `/api/school-record` | 생기부 초안 생성 |
| GET | `/api/rubrics` | 루브릭 데이터 조회 |
| GET | `/api/health` | 서버 상태 확인 |

### 평가 요청 예시

```json
POST /api/evaluate
{
  "practice_type": "p3_definition",
  "raw_text": "4교시 종료 시각(12:10)과 급식 시작 시각(12:00)의 10분 차이로...",
  "student_name": "김민준"
}
```

### 평가 응답 예시

```json
{
  "item_scores": {
    "problem_definition": {
      "score": 4,
      "evidence": "'4교시 종료 시각(12:10)과 급식 시작 시각(12:00)의 10분 차이'라는 측정 가능한 요소 포함",
      "feedback": "시간 차이를 구체적 숫자로 제시하여 문제를 명확히 정의함"
    }
  },
  "total_score": 3.57,
  "sum_score": 25,
  "max_score": 28,
  "level": "탁월",
  "praise": "측정 가능한 데이터를 활용하여...",
  "improvement": "대상 범위를 좀 더 세분화하면...",
  "action_guide": "다음에는 설문조사 데이터를 추가하여..."
}
```

---

## 환경변수

| 변수명 | 설명 | 기본값 |
|---|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API 키 (필수) | - |
| `PORT` | 백엔드 포트 (로컬) | 5001 |
| `NODE_ENV` | 환경 | development |

---

## 로컬 vs Vercel 비교

| 기능 | 로컬 (start.sh) | Vercel |
|---|---|---|
| AI 평가 | Express → Claude API | API Routes → Claude API |
| 학생/산출물 저장 | SQLite (영구) | 클라이언트 메모리 (세션) |
| 데모 모드 | 지원 | 지원 |
| 데이터베이스 | SQLite3 | 없음 |
| 서버 | Express + Next.js | 서버리스 |
| 배포 | 로컬 머신 | vercel.com |

---

## 데이터 보안

- 학생 이름은 Claude API 호출 전 자동 **비식별화** 처리 ("학생"으로 치환)
- `.env` 파일은 `.gitignore`에 포함되어 Git에 업로드되지 않음
- Vercel 배포 시 환경변수는 Vercel 대시보드에서 암호화 관리

## API 비용 참고

- Claude API는 유료 서비스입니다
- 개별 평가 1회 ≈ 2,000~3,000 토큰
- 30명 학급 × 5 실천 = 150회 평가 ≈ $10~15 예상

---

## 커스터마이징

### 루브릭 수정
`backend/data/rubrics.js` (로컬) 또는 `frontend-next/lib/rubrics.js` (Vercel)의 루브릭 객체를 수정하여 평가 기준을 커스터마이징할 수 있습니다.

### AI 모델 변경
`evaluationEngine.js`에서 `this.model`을 변경:

```javascript
this.model = 'claude-sonnet-4-20250514';   // 기본 (균형)
this.model = 'claude-opus-4-1-20250805';   // 더 정밀
this.model = 'claude-haiku-3-5-20241022';  // 더 빠르고 저렴
```

---

## 문제 해결

### 백엔드가 시작되지 않음
```bash
# 포트 사용 중인지 확인
lsof -i :5001
# backend/.env의 PORT 값을 다른 포트로 변경
```

### API 401 오류
- `backend/.env`의 `ANTHROPIC_API_KEY` 확인
- API 키의 유효성 확인: https://console.anthropic.com

### 프론트엔드에서 API 연결 실패
- 백엔드가 실행 중인지 확인 (`http://localhost:5001/api/health`)
- `frontend-next/next.config.js`의 rewrite 설정 확인

### 데이터베이스 초기화
`backend/` 폴더의 `.db` 파일을 삭제하고 백엔드를 재시작하면 빈 데이터베이스가 생성됩니다.

---

## 스펙 문서

이 프로젝트는 다음 스펙 문서를 기반으로 구현되었습니다:

- `ai_assessment_system_guide_v2.md` — 평가 가이드 (루브릭, 수준 설명, 예시)
- `tech_spec_for_developers.md` — 기술 스펙 (프롬프트, 검증 로직, 아키텍처)

---

## 라이선스

교육 목적으로 자유롭게 사용할 수 있습니다.

---

**v2.0** | 2026년 2월 | 고등학교 AI/정보 교과용
