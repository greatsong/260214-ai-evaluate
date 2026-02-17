# AI 교실 실천 평가 시스템 v2.1

> **배포 URL**: https://frontend-next-5uhonnz8d-greatsongs-projects.vercel.app

고등학교 AI/정보 교과에서 학생들의 **실천 활동 산출물**을 Claude AI로 평가하고, 성장 과정을 추적하며, 생기부 초안까지 생성하는 교사용 평가 지원 시스템입니다.

---

## 주요 기능

### 1. 개별 평가 (루브릭 기반)
- 7가지 실천 유형별 상세 루브릭 (총 29개 평가 항목)
- 항목별 1~4점 채점 + 근거(evidence) 인용 + 피드백
- 수준 판정: 탁월 / 우수 / 보통 / 미달
- 레이더 차트로 시각화

### 2. 성장 분석
- 동일 실천 활동의 복수 산출물을 시간순 비교
- 항목별 꺾은선 그래프로 성장 추이 시각화
- 성장 스토리, 가장 큰 성장, 관심 필요 영역, 다음 단계 제안

### 3. 포트폴리오 종합 평가 (FACT 프레임워크)
- **F**easibility (실현력) / **A**I literacy (AI 리터러시) / **C**ritical thinking (비판적 사고) / **T**eamwork (협업/소통)
- FACT 4축 레이더 차트 + 종합 서술

### 4. 생기부 초안 생성
- 300~500자, "~함/~보임" 문체
- 학교생활기록부 작성 규칙 준수
- 복사 가능한 텍스트 박스 제공

### 5. 학급 현황
- 학생 x 실천 유형 히트맵
- 학급 전체 평균/분포 통계

### 6. 학생 직접 제출
- 학번 + 비밀번호 인증 (첫 사용 시 자동 설정)
- QR 코드/링크로 학생이 산출물 직접 입력
- 교사 관찰 기록 모드 (실천 5, 6)

---

## 실천 유형별 평가 항목

| 실천 유형 | 항목 수 | 만점 | 평가 방식 | 평가 항목 |
|---|---|---|---|---|
| **실천 1**: 불편함 수집 | 3 | 12 | AI 채점 | 구체성, 분류 적절성, 선택 이유 깊이 |
| **실천 2**: AI와 비교하기 | 3 | 12 | AI 채점 | 나만 찾은 것의 질, 비교 분석 깊이, 결정력 |
| **실천 3**: 문제 정의서 | 7 | 28 | AI 채점 | 문제 정의, 구체성, 대상 인식, 긴급성, AI 활용, 비판적 사고, 결정 이유 |
| **실천 4**: AI 활용 일지 | 5 | 20 | AI 채점 | 프롬프트 구체성, AI 결과 요약, 수정 내용, 문제점 인식, 자기 결정 |
| **실천 5**: 구술 면접 | 4 | 16 | 교사 관찰 | 핵심 이해도, 후속 질문 대응, AI와 차별점, 발표 태도 |
| **실천 6**: 공유 실패 루틴 | 4 | 16 | 교사 관찰 | 실패 사례 구체성, 원인 분석, 토론 기여도, 개선 방안 |
| **실천 7**: 성장 성찰문 | 4 | 16 | AI 채점 | 문제 발견 변화, AI 협업 변화, 중요한 결정, 자기 이해 |

---

## 기술 스택

| 구분 | 기술 |
|---|---|
| 프론트엔드 | Next.js 14 (App Router), Tailwind CSS, Recharts |
| 백엔드 (로컬) | Express.js, SQLite3 |
| 백엔드 (Vercel) | Next.js API Routes + Turso (libSQL) |
| AI 평가 | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| 테스트 | Jest (백엔드 22개 + 프론트엔드 25개) |

---

## 프로젝트 구조

```
260214-ai-evaluate/
├── backend/                          # Express 백엔드 (로컬 전용)
│   ├── server.js                     # Express 서버 (라우트 마운트)
│   ├── routes/
│   │   ├── students.js               # 학생 CRUD + 엑셀 임포트
│   │   ├── artifacts.js              # 산출물 CRUD
│   │   ├── evaluations.js            # 평가 실행 + 조회
│   │   └── analysis.js               # 성장분석 + 포트폴리오 + 생기부
│   ├── middleware/
│   │   ├── apiResponse.js            # success() / fail() 헬퍼
│   │   ├── errorHandler.js           # 글로벌 에러 핸들러
│   │   └── validate.js               # 입력 검증 미들웨어
│   ├── services/
│   │   └── evaluationEngine.js       # Claude API 평가 엔진
│   ├── db/database.js                # SQLite DB (외래키, 인덱스)
│   ├── data/rubrics.js               # 평가 루브릭 데이터
│   └── tests/evaluationEngine.test.js
│
├── frontend-next/                    # Next.js 프론트엔드
│   ├── app/
│   │   ├── layout.js                 # 사이드바 + 데모 토글 + Toast + ErrorBoundary
│   │   ├── page.js                   # 대시보드
│   │   ├── students/page.js          # 학생 관리
│   │   ├── artifacts/page.js         # 산출물 입력 (교사 관찰 포함)
│   │   ├── evaluate/page.js          # 개별 평가 (레이더 차트)
│   │   ├── growth/page.js            # 성장 분석 (꺾은선 그래프)
│   │   ├── portfolio/page.js         # 포트폴리오 (FACT + 생기부)
│   │   ├── class/page.js             # 학급 현황 (히트맵)
│   │   ├── submit/page.js            # 학생 제출 페이지
│   │   ├── submit/my/page.js         # 학생 제출 이력
│   │   ├── guide-student/page.js     # 학생용 작성 가이드
│   │   ├── guide-teacher/page.js     # 교사용 사용 가이드
│   │   └── api/                      # Vercel API Routes
│   │       ├── students/route.js     # 학생 CRUD (Turso)
│   │       ├── artifacts/route.js    # 산출물 CRUD (Turso)
│   │       ├── evaluations/route.js  # 평가 조회 (Turso)
│   │       ├── evaluate/route.js     # AI 평가 실행
│   │       ├── growth-analysis/route.js
│   │       ├── portfolio-feedback/route.js
│   │       ├── school-record/route.js
│   │       └── students/lookup|set-pin|reset-pin/
│   ├── components/
│   │   ├── Toast.js                  # ToastProvider + useToast 훅
│   │   ├── ErrorBoundary.js          # 렌더링 에러 캐치
│   │   ├── StudentSelector.js        # 학생/실천유형 셀렉터 (접근성)
│   │   ├── EmptyState.js             # 빈 상태 표시
│   │   ├── Charts.js                 # 레이더/FACT/꺾은선 차트
│   │   ├── ScoreTable.js             # 점수 테이블
│   │   ├── FeedbackCard.js           # 피드백 카드
│   │   └── LevelBadge.js             # 수준 뱃지
│   ├── lib/
│   │   ├── api.js                    # API 호출 + 데모 모드 + unwrap
│   │   ├── turso.js                  # Turso (libSQL) 클라이언트
│   │   ├── dbInit.js                 # Turso 스키마 초기화
│   │   ├── evaluationEngine.js       # 평가 엔진 (ES 모듈)
│   │   ├── rubrics.js                # 루브릭 (ES 모듈)
│   │   ├── demoData.js               # 데모 샘플 데이터
│   │   └── constants.js              # 상수 정의
│   ├── __tests__/evaluationEngine.test.js
│   └── vercel.json                   # Vercel 배포 설정
│
├── start.sh                          # 로컬 통합 실행 스크립트
├── ai_assessment_system_guide_v2.md  # 평가 가이드 스펙
└── tech_spec_for_developers.md       # 기술 스펙 문서
```

---

## 실행 방법

이 프로젝트는 **두 가지 모드**로 운영됩니다:

| 모드 | 설명 | AI 평가 | 데이터 저장 |
|------|------|---------|------------|
| **데모 모드** (기본) | 샘플 데이터로 전체 기능 체험 | X | 인메모리 (새로고침 시 초기화) |
| **실제 모드** | AI 평가 + 데이터 영구 저장 | O | SQLite(로컬) 또는 Turso(Vercel) |

사이드바의 **"데모 ON/OFF"** 버튼으로 전환합니다.

---

### 방법 1: 데모 모드만 (가장 간단)

별도 환경변수 없이 즉시 실행할 수 있습니다.

```bash
cd frontend-next
npm install
npm run dev
```

- http://localhost:3000 접속
- 5명의 샘플 학생, 11개 산출물, 7개 평가 결과로 전체 기능 체험
- AI 평가는 동작하지 않음 (데모 결과 표시)

---

### 방법 2: 프론트엔드만 + AI 평가

Express 백엔드 없이 Next.js API Routes로 AI 평가를 실행합니다.

```bash
# frontend-next/.env.local 생성
echo "ANTHROPIC_API_KEY=sk-ant-api03-여기에-실제키" > frontend-next/.env.local

cd frontend-next
npm install
npm run dev
```

- http://localhost:3000 접속
- 사이드바에서 **"데모 OFF"** 전환
- AI 평가/성장분석/포트폴리오/생기부 기능 사용 가능
- Turso 미설정 시 CRUD 데이터는 데모 데이터로 폴백

---

### 방법 3: 풀스택 로컬 (Express + Next.js)

데이터가 SQLite에 영구 저장됩니다. 모든 기능 사용 가능.

```bash
# 통합 실행 (터미널 1개)
chmod +x start.sh
./start.sh
```

또는 터미널 2개로 수동 실행:

```bash
# 터미널 1: 백엔드 (포트 5001)
cd backend
npm install
echo "ANTHROPIC_API_KEY=sk-ant-api03-여기에-실제키" > .env
npm run dev

# 터미널 2: 프론트엔드 (포트 3000)
cd frontend-next
npm install
npm run dev
```

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:5001/api
- 사이드바에서 **"데모 OFF"** 전환 후 사용
- 데이터: `backend/data/assessment.db` (SQLite, 영구 저장)

---

### 방법 4: Vercel 배포 (프로덕션)

#### Step 1: Turso DB 생성 (무료, 선택사항)

Turso를 설정하면 Vercel에서도 데이터가 영구 저장됩니다. 설정하지 않으면 데모 모드로 동작합니다.

```bash
# Turso CLI 설치 (macOS)
brew install tursodatabase/tap/turso

# 로그인 + DB 생성
turso auth login
turso db create ai-evaluate

# URL과 토큰 확인 (Vercel 환경변수에 입력)
turso db show ai-evaluate --url
turso db tokens create ai-evaluate
```

#### Step 2: Vercel 프로젝트 설정

1. [vercel.com](https://vercel.com) → **New Project** → GitHub 저장소 연결
2. 설정:
   - **Root Directory**: `frontend-next`
   - **Framework Preset**: Next.js (자동 감지)
3. **Environment Variables** 추가:

| 변수명 | 값 | 필수 |
|--------|-----|------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | O (AI 평가) |
| `TURSO_DATABASE_URL` | `libsql://ai-evaluate-xxx.turso.io` | 권장 (데이터 영속성) |
| `TURSO_AUTH_TOKEN` | `eyJhbGciOi...` | 권장 (Turso 인증) |

4. **Deploy** 클릭

#### Step 3: CLI로 배포 (대안)

```bash
cd frontend-next
npx vercel --prod
```

#### Step 4: 사용

- 배포된 URL 접속
- 사이드바에서 **"데모 OFF"** 전환
- 학생 등록 → 산출물 입력 → AI 평가 순으로 사용

---

## 테스트 실행

```bash
# 백엔드 (22개 테스트)
cd backend && npm test

# 프론트엔드 (25개 테스트)
cd frontend-next && npm test
```

테스트 대상: JSON 파싱, 비식별화, 입력 검증, 점수 클램핑, 레벨 판정, 평균 계산

---

## 환경변수 전체 목록

| 변수명 | 설명 | 기본값 | 사용처 |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API 키 | (필수) | 백엔드 + Vercel |
| `PORT` | 백엔드 포트 | `5001` | 로컬 백엔드 |
| `TURSO_DATABASE_URL` | Turso DB URL | (없으면 데모 폴백) | Vercel |
| `TURSO_AUTH_TOKEN` | Turso 인증 토큰 | (없으면 데모 폴백) | Vercel |
| `CLAUDE_MODEL` | Claude 모델명 | `claude-sonnet-4-20250514` | 양쪽 |
| `CLAUDE_TEMPERATURE` | 기본 temperature | `0.3` | 양쪽 |
| `CLAUDE_RETRY_TEMPERATURE` | 재시도 temperature | `0.2` | 양쪽 |
| `CLAUDE_RETRY_COUNT` | 최대 재시도 횟수 | `3` | 양쪽 |

---

## 로컬 vs Vercel 비교

| 기능 | 로컬 (Express + Next.js) | Vercel (Turso 없이) | Vercel (Turso 연동) |
|---|---|---|---|
| AI 평가 | Express → Claude API | API Routes → Claude API | API Routes → Claude API |
| 데이터 저장 | SQLite (영구) | 데모 데이터 (세션) | Turso DB (영구) |
| 학생 인증 | SQLite PIN | 데모 데이터 | Turso PIN |
| 엑셀 임포트 | 지원 | 미지원 | 미지원 |
| 서버 | Express + Next.js | 서버리스 | 서버리스 |

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
    ↓
DB 저장 (로컬: SQLite, Vercel: Turso)
```

### API 엔드포인트

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/students` | 학생 목록 조회 |
| POST | `/api/students` | 학생 등록 |
| DELETE | `/api/students/:id` | 학생 삭제 |
| GET | `/api/students/lookup?number=10101` | 학번으로 학생 조회 |
| POST | `/api/students/set-pin` | 학생 비밀번호 설정 |
| POST | `/api/students/reset-pin` | 학생 비밀번호 초기화 |
| GET | `/api/artifacts` | 산출물 목록 조회 |
| POST | `/api/artifacts` | 산출물 등록 |
| DELETE | `/api/artifacts/:id` | 산출물 삭제 |
| GET | `/api/evaluations` | 평가 결과 조회 |
| POST | `/api/evaluate` | AI 개별 평가 실행 |
| POST | `/api/growth-analysis` | AI 성장 분석 |
| POST | `/api/portfolio-feedback` | AI FACT 포트폴리오 평가 |
| POST | `/api/school-record` | AI 생기부 초안 생성 |
| GET | `/api/rubrics` | 루브릭 데이터 조회 |
| GET | `/api/health` | 서버 상태 확인 |

---

## 데이터 보안

- 학생 이름은 Claude API 호출 전 자동 **비식별화** 처리 ("학생"으로 치환)
- `.env` 파일은 `.gitignore`에 포함되어 Git에 업로드되지 않음
- Vercel 배포 시 환경변수는 Vercel 대시보드에서 암호화 관리
- 학생 비밀번호는 서버에 저장 (PIN 방식, 교사가 초기화 가능)

## API 비용 참고

- Claude API는 유료 서비스입니다
- 개별 평가 1회: 약 2,000~3,000 토큰
- 30명 학급 x 5 실천 = 150회 평가: 약 $10~15 예상

---

## 커스터마이징

### 루브릭 수정
`backend/data/rubrics.js` (로컬) 또는 `frontend-next/lib/rubrics.js` (Vercel)의 루브릭 객체를 수정하여 평가 기준을 커스터마이징할 수 있습니다.

### AI 모델 변경
환경변수 `CLAUDE_MODEL`로 설정하거나, `evaluationEngine.js`에서 직접 수정:

```bash
# 환경변수로 변경
CLAUDE_MODEL=claude-sonnet-4-20250514    # 기본 (균형)
CLAUDE_MODEL=claude-opus-4-1-20250805    # 더 정밀
CLAUDE_MODEL=claude-haiku-4-5-20251001   # 더 빠르고 저렴
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
- `backend/.env` 또는 `frontend-next/.env.local`의 `ANTHROPIC_API_KEY` 확인
- API 키 유효성 확인: https://console.anthropic.com

### Vercel에서 데이터가 저장되지 않음
- Turso 환경변수(`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`)가 설정되어 있는지 확인
- 설정 후 재배포 필요: `vercel --prod`

### 데이터베이스 초기화 (로컬)
```bash
rm backend/data/assessment.db
# 백엔드 재시작하면 빈 DB 자동 생성
```

---

## 스펙 문서

- `ai_assessment_system_guide_v2.md` — 평가 가이드 (루브릭, 수준 설명, 예시)
- `tech_spec_for_developers.md` — 기술 스펙 (프롬프트, 검증 로직, 아키텍처)
- `IMPROVEMENT_PLAN.md` — v2.1 개선 계획

---

## 라이선스

교육 목적으로 자유롭게 사용할 수 있습니다.

---

**v2.1** | 2026년 2월 | 고등학교 AI/정보 교과용
