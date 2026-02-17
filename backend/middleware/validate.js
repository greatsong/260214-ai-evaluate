/**
 * 입력 검증 미들웨어
 */

const { fail } = require('./apiResponse');

function validateStudent(req, res, next) {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return fail(res, 'VALIDATION_ERROR', '이름은 필수입니다.');
  }
  next();
}

function validateArtifact(req, res, next) {
  const { student_id, practice_type, raw_text } = req.body;
  if (!student_id) return fail(res, 'VALIDATION_ERROR', '학생 ID가 필요합니다.');
  if (!practice_type) return fail(res, 'VALIDATION_ERROR', '실천 유형이 필요합니다.');
  if (!raw_text || raw_text.trim().length < 10) {
    return fail(res, 'VALIDATION_ERROR', '산출물은 최소 10자 이상이어야 합니다.');
  }
  next();
}

function validateEvaluation(req, res, next) {
  const { artifact_id, practice_type, raw_text } = req.body;
  if (!artifact_id) return fail(res, 'VALIDATION_ERROR', '산출물 ID가 필요합니다.');
  if (!practice_type) return fail(res, 'VALIDATION_ERROR', '실천 유형이 필요합니다.');
  if (!raw_text || raw_text.trim().length < 10) {
    return fail(res, 'VALIDATION_ERROR', '산출물 텍스트가 필요합니다.');
  }
  next();
}

function validateGrowthAnalysis(req, res, next) {
  const { student_id, practice_type, artifact_ids } = req.body;
  if (!student_id) return fail(res, 'VALIDATION_ERROR', '학생 ID가 필요합니다.');
  if (!practice_type) return fail(res, 'VALIDATION_ERROR', '실천 유형이 필요합니다.');
  if (!artifact_ids || !Array.isArray(artifact_ids) || artifact_ids.length < 2) {
    return fail(res, 'VALIDATION_ERROR', '성장 분석을 위해 최소 2개 이상의 산출물 ID가 필요합니다.');
  }
  next();
}

function validatePortfolio(req, res, next) {
  const { student_id } = req.body;
  if (!student_id) return fail(res, 'VALIDATION_ERROR', '학생 ID가 필요합니다.');
  next();
}

module.exports = {
  validateStudent,
  validateArtifact,
  validateEvaluation,
  validateGrowthAnalysis,
  validatePortfolio,
};
