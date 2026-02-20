/**
 * AI 기반 프로젝트 평가 시스템 - Express 백엔드
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const Database = require('./db/database');
const EvaluationEngine = require('./services/evaluationEngine');
const errorHandler = require('./middleware/errorHandler');
const { success } = require('./middleware/apiResponse');

const app = express();
const PORT = process.env.PORT || 5001;

// 미들웨어
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// 초기화
const db = new Database();
const evaluationEngine = new EvaluationEngine(process.env.ANTHROPIC_API_KEY);

// 라우트
app.use('/api/students', require('./routes/students')(db));
app.use('/api/artifacts', require('./routes/artifacts')(db));
app.use('/api', require('./routes/evaluations')(db, evaluationEngine));
app.use('/api', require('./routes/analysis')(db, evaluationEngine));

// 루브릭
app.get('/api/rubrics', (req, res) => {
  const rubrics = require('./data/rubrics');
  success(res, rubrics);
});

// 헬스체크
app.get('/api/health', (req, res) => {
  success(res, { status: 'ok', version: '2.1.0' });
});

// 글로벌 에러 핸들러 (반드시 라우트 뒤에 등록)
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  console.log(`백엔드 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`API: http://localhost:${PORT}/api`);
});

module.exports = app;
