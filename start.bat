@echo off
REM AI 교실 실천 평가 시스템 - Windows 통합 실행 스크립트

echo.
echo 🎓 AI 교실 실천 평가 시스템 시작...
echo.

REM 백엔드 시작
echo 📦 백엔드 시작 중...
cd backend

REM node_modules 확인
if not exist node_modules (
    echo 📥 백엔드 패키지 설치 중...
    call npm install
)

REM .env 파일 확인
if not exist .env (
    echo ⚠️  backend\.env 파일이 없습니다
    echo 아래 내용으로 backend\.env 파일을 생성해주세요:
    echo PORT=5000
    echo NODE_ENV=development
    echo ANTHROPIC_API_KEY=your_api_key_here
    pause
    exit /b 1
)

REM 백엔드 시작
echo ✅ 백엔드를 새 창에서 시작합니다...
start "Backend - npm start" cmd /k npm start

timeout /t 3

REM 프론트엔드 시작
echo.
echo ⚛️  프론트엔드 시작 중...
cd ..\frontend

REM node_modules 확인
if not exist node_modules (
    echo 📥 프론트엔드 패키지 설치 중...
    call npm install
)

REM 프론트엔드 시작
echo ✅ 프론트엔드를 새 창에서 시작합니다...
start "Frontend - npm start" cmd /k npm start

echo.
echo ========================================
echo ✅ 모든 서비스가 시작되었습니다!
echo ========================================
echo.
echo 🌐 프론트엔드: http://localhost:3000
echo 🔌 백엔드 API: http://localhost:5000/api
echo.
echo ⚠️  종료하려면: 각 창에서 Ctrl+C 누르기
echo.
pause
