# 🎓 AI 기반 프로젝트 평가 시스템 - 빠른 시작 가이드

## ✅ 설치 완료 현황

JavaScript 기반의 완전한 웹 애플리케이션이 준비되었습니다.

### 프로젝트 구성
- ✅ **백엔드**: Express.js + SQLite + Claude API
- ✅ **프론트엔드**: React 18 + CSS
- ✅ **데이터베이스**: SQLite (자동 초기화)
- ✅ **API**: RESTful 엔드포인트

---

## 🚀 5분 내 시작하기

### macOS / Linux

```bash
cd /Users/greatsong/greatsong-project/260214-ai-evaluate

# 백엔드 .env 파일 설정
echo 'ANTHROPIC_API_KEY=sk-ant-...' > backend/.env
# (Claude API 키 입력)

# 실행
chmod +x start.sh
./start.sh
```

### Windows

```bash
cd C:\Users\greatsong\greatsong-project\260214-ai-evaluate

# backend\.env 파일을 텍스트 편집기로 열어서 API 키 입력

# 실행
start.bat
```

### 수동 실행 (권장)

**터미널 1 - 백엔드:**
```bash
cd backend
npm install
npm start
```

**터미널 2 - 프론트엔드:**
```bash
cd frontend
npm install
npm start
```

---

## 📍 접속 주소

- 🌐 **프론트엔드**: http://localhost:3000
- 🔌 **백엔드 API**: http://localhost:5000/api
- 📊 **헬스 체크**: http://localhost:5000/api/health

---

## 🎯 첫 시작 체크리스트

- [ ] Node.js 설치됨 (`node -v` 확인)
- [ ] Claude API 키 준비됨 (https://console.anthropic.com)
- [ ] `backend/.env` 파일에 API 키 입력됨
- [ ] 백엔드 실행됨 (터미널 1)
- [ ] 프론트엔드 실행됨 (터미널 2)
- [ ] 브라우저에서 http://localhost:3000 열림

---

## 📖 주요 문서

| 문서 | 내용 |
|------|------|
| `README.md` | 📖 전체 프로젝트 설명 |
| `SETUP.md` | 🚀 상세 설치 가이드 |
| `PROJECT_STRUCTURE.md` | 📁 프로젝트 구조 |
| `ai_assessment_system_guide_v2.md` | 🎓 교육 철학 & 루브릭 |
| `tech_spec_for_developers.md` | 🛠️ 기술 스펙 |

---

## 🎓 사용 시나리오

### 1️⃣ 학생 등록
```
학생 관리 → 학생 추가 
→ 이름: "김철수", 반: "1반", 번호: 1 입력
```

### 2️⃣ 산출물 입력
```
산출물 입력 → 학생 선택
→ 실천 활동: "불편함 수집"
→ 내용 붙여넣기 → 저장
```

### 3️⃣ AI 평가
```
개별 평가 → 산출물 선택
→ "AI 평가 수행" → 점수 & 피드백 확인
```

### 4️⃣ 성장 분석 (2개 이상 산출물 필요)
```
성장 분석 → 학생 선택 → 활동 선택
→ "성장 분석 실행" → 결과 확인
```

---

## 🔧 설정 파일

### `backend/.env` - 필수
```ini
PORT=5000
NODE_ENV=development
ANTHROPIC_API_KEY=sk-ant-...your-key...
```

### `frontend/package.json` - 자동 설정됨
```json
"proxy": "http://localhost:5000"
```

---

## 📂 핵심 파일

| 파일 | 역할 |
|------|------|
| `backend/server.js` | 백엔드 서버 진입점 |
| `backend/db/database.js` | 데이터베이스 관리 |
| `backend/services/evaluationEngine.js` | AI 평가 엔진 |
| `frontend/src/App.js` | React 메인 앱 |
| `frontend/src/pages/*.js` | 각 페이지 컴포넌트 |

---

## ✨ 주요 기능

### 대시보드
- 시스템 소개
- 실시간 통계 (학생, 산출물, 평가)

### 학생 관리
- ➕ 학생 추가
- 📋 학생 목록
- 🗑️ 학생 삭제

### 산출물 입력
- 📝 산출물 작성 및 저장
- 📅 날짜 기록
- 🏷️ 차시 표기

### AI 평가
- 🤖 Claude API 기반 자동 평가
- 📊 루브릭별 점수 (1~4점)
- 💭 개선 피드백

### 성장 분석
- 📈 시간에 따른 진도 추적
- 📊 항목별 점수 변화
- 💡 개선 제안

### 포트폴리오
- 🎯 전체 학습 과정 분석
- 💬 종합 피드백
- 🌟 강점 강화 방안

### 학급 현황
- 👥 학급 전체 통계
- 📊 점수 분포
- 📋 최근 평가 목록

---

## 🚨 일반적인 문제 해결

### "Cannot find module"
```bash
cd backend && npm install
cd ../frontend && npm install
```

### "Port 5000 already in use"
```bash
# 백엔드/.env에서 PORT를 변경:
PORT=5001
```

### "API 요청 실패"
```bash
# 백엔드가 실행 중인지 확인:
curl http://localhost:5000/api/health

# 결과: {"status":"ok"} 나타나야 함
```

### "Claude API 오류"
```bash
# 1. 백엔드/.env 파일 확인
# 2. API 키 유효성 확인: https://console.anthropic.com
# 3. 인터넷 연결 확인
```

---

## 🔄 개발 팁

### 핫 리로딩 활성화
프론트엔드는 자동 리로드됩니다. 파일 저장 시 즉시 반영됩니다.

### 백엔드 디버깅
```bash
cd backend
NODE_ENV=development npm start
```

### 데이터베이스 초기화
```bash
# 데이터 모두 삭제 후 재생성
rm backend/data/assessment.db
npm start  # 자동으로 재생성됨
```

---

## 📊 API 예제

### 학생 추가
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"김철수","class_name":"1반","number":1}'
```

### 산출물 조회
```bash
curl http://localhost:5000/api/artifacts
```

### AI 평가
```bash
curl -X POST http://localhost:5000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "artifact_id":1,
    "practice_type":"p1_discomfort",
    "raw_text":"불편함 내용..."
  }'
```

---

## 🎯 다음 단계

1. **데이터 입력**: 학생과 산출물 추가
2. **평가 수행**: AI가 자동으로 평가
3. **성장 추적**: 시간에 따른 발전 분석
4. **피드백 활용**: 학생에게 결과 공유

---

## 💡 팁

- 🔐 API 키는 절대 공개하지 마세요
- 💾 정기적으로 데이터 백업하세요
- 📝 로그를 확인하여 문제를 진단하세요
- 🚀 필요시 포트 번호를 변경할 수 있습니다

---

## 📚 추가 리소스

- [Claude API 문서](https://docs.anthropic.com)
- [React 문서](https://react.dev)
- [Express.js 문서](https://expressjs.com)
- [SQLite 문서](https://www.sqlite.org/docs.html)

---

## 🆘 지원

문제가 발생하면:
1. `README.md`의 문제 해결 섹션 확인
2. `SETUP.md`의 디버깅 가이드 확인
3. 백엔드/프론트엔드 콘솔 로그 확인
4. 원본 문서 참고 (`ai_assessment_system_guide_v2.md`)

---

**🎉 축하합니다! 이제 AI 기반 프로젝트 평가 시스템을 사용할 준비가 되었습니다!**

**최종 업데이트**: 2026년 2월 14일  
**버전**: 1.0.0 (JavaScript 기반)  
**상태**: ✅ 개발 완료 & 사용 준비
