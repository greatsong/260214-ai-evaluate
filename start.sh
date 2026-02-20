#!/bin/bash

# AI 기반 프로젝트 평가 시스템 v2.0 — 로컬 통합 실행

echo "🎓 AI 기반 프로젝트 평가 시스템 v2.0 시작..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cleanup() {
  echo ""
  echo -e "${YELLOW}종료 중...${NC}"
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

# ─── 백엔드 ───
echo -e "${BLUE}📦 백엔드 준비 중...${NC}"
cd "$SCRIPT_DIR/backend"

if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}📥 백엔드 패키지 설치...${NC}"
  npm install
fi

if [ ! -f ".env" ]; then
  echo -e "${RED}⚠️  backend/.env 파일이 없습니다${NC}"
  echo "아래 내용으로 backend/.env 파일을 생성해주세요:"
  echo "PORT=5001"
  echo "NODE_ENV=development"
  echo "ANTHROPIC_API_KEY=sk-ant-api03-..."
  exit 1
fi

npm start &
BACKEND_PID=$!
sleep 2

# ─── 프론트엔드 (Next.js) ───
echo ""
echo -e "${BLUE}⚛️  프론트엔드 준비 중...${NC}"
cd "$SCRIPT_DIR/frontend-next"

if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}📥 프론트엔드 패키지 설치...${NC}"
  npm install
fi

npx next dev -p 3000 &
FRONTEND_PID=$!

sleep 3

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ 시스템이 시작되었습니다!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "  🌐 프론트엔드: http://localhost:3000"
echo "  🔌 백엔드 API: http://localhost:5001/api"
echo ""
echo "  ⚠️  종료: Ctrl+C"
echo ""

wait
