/**
 * 분석 라우트 (성장분석, 포트폴리오, 생기부)
 */

const express = require('express');
const { success, fail } = require('../middleware/apiResponse');
const { validateGrowthAnalysis, validatePortfolio } = require('../middleware/validate');

module.exports = function (db, evaluationEngine) {
  const router = express.Router();

  // 성장 분석
  router.post('/growth-analysis', validateGrowthAnalysis, async (req, res, next) => {
    try {
      const { student_id, practice_type, artifact_ids } = req.body;
      const artifacts = await Promise.all(artifact_ids.map(id => db.getArtifact(id)));

      const analysis = await evaluationEngine.generateGrowthAnalysis(practice_type, artifacts);

      if (analysis.error) {
        return fail(res, 'ANALYSIS_FAILED', analysis.error);
      }

      const analysisId = await db.addGrowthAnalysis(
        student_id, practice_type,
        JSON.stringify(artifact_ids),
        JSON.stringify(analysis)
      );

      success(res, { id: analysisId, student_id, practice_type, analysis });
    } catch (err) { next(err); }
  });

  // 포트폴리오 피드백
  router.post('/portfolio-feedback', validatePortfolio, async (req, res, next) => {
    try {
      const { student_id, student_name } = req.body;
      const artifacts = await db.getArtifactsByStudent(student_id);

      if (!artifacts || artifacts.length === 0) {
        return fail(res, 'NO_ARTIFACTS', '산출물이 없습니다.');
      }

      const result = await evaluationEngine.generatePortfolioFeedback(student_name, artifacts);

      if (result.error) {
        return fail(res, 'PORTFOLIO_FAILED', result.error);
      }

      success(res, result);
    } catch (err) { next(err); }
  });

  // 생기부 초안
  router.post('/school-record', validatePortfolio, async (req, res, next) => {
    try {
      const { student_id, student_name, portfolio_result } = req.body;
      const artifacts = await db.getArtifactsByStudent(student_id);

      if (!artifacts || artifacts.length === 0) {
        return fail(res, 'NO_ARTIFACTS', '산출물이 없습니다.');
      }

      const result = await evaluationEngine.generateSchoolRecord(student_name, artifacts, portfolio_result);

      if (result.error) {
        return fail(res, 'SCHOOL_RECORD_FAILED', result.error);
      }

      success(res, result);
    } catch (err) { next(err); }
  });

  return router;
};
