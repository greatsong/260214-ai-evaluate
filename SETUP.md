# 🚀 설치 및 실행 가이드

## 📋 사전 요구사항

1. **Node.js 16.0 이상**
   ```bash
   node --version  # 확인
   ```
   설치: https://nodejs.org

2. **Anthropic API Key**
   - https://console.anthropic.com 에서 가입
   - API 키 발급

## 🔧 설치 단계

### Step 1: 프로젝트 디렉토리 진입

```bash
cd /Users/greatsong/greatsong-project/260214-ai-evaluate
```

### Step 2: 백엔드 설정

```bash
cd backend

# 패키지 설치
npm install

# .env 파일 설정
# backend/.env 파일을 열고 다음과 같이 수정:
# ANTHROPIC_API_KEY=sk-ant-...your-key...
```

### Step 3: 프론트엔드 설정

새 터미널 열기:

```bash
cd frontend

# 패키지 설치
npm install
```

## ▶️ 실행

### 백엔드 시작 (터미널 1)

```bash
cd backend
npm start
```

예상 출력:
```
✅ 백엔드 서버가 포트 5000에서 실행 중입니다
📝 API 문서: http://localhost:5000/api
```

### 프론트엔드 시작 (터미널 2)

```bash
cd frontend
npm start
```

자동으로 브라우저가 열려서 `http://localhost:3000`에서 실행됩니다.

## ✅ 확인

1. 프론트엔드: http://localhost:3000 열림
2. 네비게이션 바가 보여야 함
3. "학생 관리"에서 학생 추가 가능

## 🎓 처음 사용하기

1. **학생 등록**
   - 좌측 메뉴 → "학생 관리"
   - "학생 추가" 탭
   - 이름, 반, 번호 입력 후 추가

2. **산출물 입력**
   - 좌측 메뉴 → "산출물 입력"
   - 학생, 실천 활동, 내용 입력
   - 저장

3. **AI 평가**
   - 좌측 메뉴 → "개별 평가"
   - 산출물 선택
   - "AI 평가 수행" 클릭
   - 결과 확인

## 🔍 디버깅

### 백엔드 포트 에러
```bash
# 포트 5000이 이미 사용 중이면:
# backend/.env에서 PORT를 변경:
PORT=5001
```

### API 연결 실패
1. 백엔드가 실행 중인지 확인
2. 프론트엔드 `package.json`의 proxy 설정 확인:
   ```json
   "proxy": "http://localhost:5000"
   ```
3. 백엔드 재시작

### Claude API 오류
1. API 키 확인 (backend/.env)
2. API 사용량 확인: https://console.anthropic.com
3. 인터넷 연결 확인

## 📝 환경 변수

### backend/.env
```
PORT=5000
NODE_ENV=development
ANTHROPIC_API_KEY=sk-ant-...
```

## 🛑 종료하기

양쪽 터미널에서 `Ctrl+C` 누르기

---

**문제 발생 시**: README.md의 문제 해결 섹션을 참고하세요.
