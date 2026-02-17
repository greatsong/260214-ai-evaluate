/**
 * 평가 라우트
 */

const express = require('express');
const { success, fail } = require('../middleware/apiResponse');
const { validateEvaluation } = require('../middleware/validate');

module.exports = function (db, evaluationEngine) {
  const router = express.Router();

  // 평가 목록 조회
  router.get('/evaluations', async (req, res, next) => {
    try {
      const { artifact_id, student_id, eval_type } = req.query;
      const evaluations = await db.getEvaluations(artifact_id, student_id, eval_type);
      success(res, evaluations);
    } catch (err) { next(err); }
  });

  // AI 평가 실행
  router.post('/evaluate', validateEvaluation, async (req, res, next) => {
    try {
      const { artifact_id, practice_type, raw_text, student_name } = req.body;

      const result = await evaluationEngine.evaluateArtifact(practice_type, raw_text, student_name);

      if (result.error) {
        return fail(res, 'EVALUATION_FAILED', result.error);
      }

      const feedback = JSON.stringify({
        praise: result.praise || '',
        improvement: result.improvement || '',
        action_guide: result.action_guide || '',
      });

      const evalId = await db.addEvaluation(
        artifact_id, 'individual',
        JSON.stringify(result.item_scores),
        result.total_score, feedback,
        JSON.stringify(result)
      );

      success(res, { id: evalId, artifact_id, ...result });
    } catch (err) { next(err); }
  });

  return router;
};
