/**
 * AI 교실 실천 평가 시스템 - Express 백엔드
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const xlsx = require('xlsx');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// 미들웨어
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// 데이터베이스 초기화
const Database = require('./db/database');
const db = new Database();

// 평가 엔진
const EvaluationEngine = require('./services/evaluationEngine');
const evaluationEngine = new EvaluationEngine(process.env.ANTHROPIC_API_KEY);

// ============================================================
// 라우트 — 학생 관리
// ============================================================

app.get('/api/students', async (req, res) => {
  try {
    const students = await db.getStudents();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const { student_number, name, class_name, number } = req.body;
    const studentId = await db.addStudent(student_number, name, class_name, number);
    res.json({ id: studentId, student_number, name, class_name, number });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await db.getStudent(req.params.id);
    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ error: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    await db.deleteStudent(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 엑셀 파일에서 학생 일괄 업로드
app.post('/api/students/import/excel', async (req, res) => {
  try {
    const { fileData, fileName } = req.body;

    if (!fileData) {
      return res.status(400).json({ error: '파일 데이터가 없습니다' });
    }

    const buffer = Buffer.from(fileData, 'base64');
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet);

    if (rows.length === 0) {
      return res.status(400).json({ error: '엑셀 파일에 데이터가 없습니다' });
    }

    const results = { success: [], failed: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const student_number = row['학번'] || row['studentNumber'] || row['student_number'] || '';
        const name = row['이름'] || row['name'] || '';
        const class_name = row['반'] || row['className'] || row['class_name'] || '';
        const number = parseInt(row['번호'] || row['number'] || 0);

        if (!student_number || !name) {
          results.failed.push({ rowNum: i + 2, reason: '학번 또는 이름이 없습니다' });
          continue;
        }

        const studentId = await db.addStudent(student_number, name, class_name, number);
        results.success.push({ id: studentId, student_number, name, class_name, number });
      } catch (err) {
        results.failed.push({ rowNum: i + 2, reason: err.message });
      }
    }

    res.json({
      total: rows.length,
      successCount: results.success.length,
      failureCount: results.failed.length,
      results
    });
  } catch (error) {
    res.status(500).json({ error: '엑셀 파일 처리 오류: ' + error.message });
  }
});

// ============================================================
// 라우트 — 산출물 관리
// ============================================================

app.get('/api/artifacts', async (req, res) => {
  try {
    const { student_id, practice_type } = req.query;
    const artifacts = await db.getArtifacts(student_id, practice_type);
    res.json(artifacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/artifacts', async (req, res) => {
  try {
    const { student_id, practice_type, raw_text, date, session } = req.body;
    const artifactId = await db.addArtifact(student_id, practice_type, raw_text, date, session);
    res.json({ id: artifactId, student_id, practice_type });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/artifacts/:id', async (req, res) => {
  try {
    const artifact = await db.getArtifact(req.params.id);
    if (artifact) {
      res.json(artifact);
    } else {
      res.status(404).json({ error: 'Artifact not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/artifacts/:id', async (req, res) => {
  try {
    await db.deleteArtifact(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 라우트 — 평가
// ============================================================

app.get('/api/evaluations', async (req, res) => {
  try {
    const { artifact_id, student_id, eval_type } = req.query;
    const evaluations = await db.getEvaluations(artifact_id, student_id, eval_type);
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/evaluate', async (req, res) => {
  try {
    const { artifact_id, practice_type, raw_text, student_name } = req.body;

    const result = await evaluationEngine.evaluateArtifact(
      practice_type, raw_text, student_name
    );

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    // 구조화된 피드백 저장
    const feedback = JSON.stringify({
      praise: result.praise || '',
      improvement: result.improvement || '',
      action_guide: result.action_guide || ''
    });

    const evalId = await db.addEvaluation(
      artifact_id,
      'individual',
      JSON.stringify(result.item_scores),
      result.total_score,
      feedback,
      JSON.stringify(result)
    );

    res.json({
      id: evalId,
      artifact_id,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 라우트 — 성장 분석
// ============================================================

app.post('/api/growth-analysis', async (req, res) => {
  try {
    const { student_id, practice_type, artifact_ids } = req.body;

    const artifacts = await Promise.all(artifact_ids.map(id => db.getArtifact(id)));

    const analysis = await evaluationEngine.generateGrowthAnalysis(practice_type, artifacts);

    if (analysis.error) {
      return res.status(400).json({ error: analysis.error });
    }

    const analysisId = await db.addGrowthAnalysis(
      student_id, practice_type,
      JSON.stringify(artifact_ids),
      JSON.stringify(analysis)
    );

    res.json({ id: analysisId, student_id, practice_type, analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 라우트 — 포트폴리오 (FACT 프레임워크)
// ============================================================

app.post('/api/portfolio-feedback', async (req, res) => {
  try {
    const { student_id, student_name } = req.body;

    const artifacts = await db.getArtifactsByStudent(student_id);

    if (!artifacts || artifacts.length === 0) {
      return res.status(400).json({ error: '산출물이 없습니다.' });
    }

    const result = await evaluationEngine.generatePortfolioFeedback(student_name, artifacts);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 라우트 — 생기부 초안
// ============================================================

app.post('/api/school-record', async (req, res) => {
  try {
    const { student_id, student_name, portfolio_result } = req.body;

    const artifacts = await db.getArtifactsByStudent(student_id);

    if (!artifacts || artifacts.length === 0) {
      return res.status(400).json({ error: '산출물이 없습니다.' });
    }

    const result = await evaluationEngine.generateSchoolRecord(
      student_name, artifacts, portfolio_result
    );

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 라우트 — 기타
// ============================================================

app.get('/api/rubrics', (req, res) => {
  try {
    const rubrics = require('./data/rubrics');
    res.json(rubrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0' });
});

// ============================================================
// 서버 시작
// ============================================================

app.listen(PORT, () => {
  console.log(`\u2705 백엔드 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`\ud83d\udcdd API: http://localhost:${PORT}/api`);
});

module.exports = app;
