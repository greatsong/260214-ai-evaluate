/**
 * 산출물 관리 라우트
 */

const express = require('express');
const { success, fail } = require('../middleware/apiResponse');
const { validateArtifact } = require('../middleware/validate');

module.exports = function (db) {
  const router = express.Router();

  // 산출물 목록
  router.get('/', async (req, res, next) => {
    try {
      const { student_id, practice_type } = req.query;
      const artifacts = await db.getArtifacts(student_id, practice_type);
      success(res, artifacts);
    } catch (err) { next(err); }
  });

  // 산출물 추가
  router.post('/', validateArtifact, async (req, res, next) => {
    try {
      const { student_id, practice_type, raw_text, date, session } = req.body;
      const artifactId = await db.addArtifact(student_id, practice_type, raw_text, date, session);
      success(res, { id: artifactId, student_id, practice_type }, 201);
    } catch (err) { next(err); }
  });

  // 산출물 상세
  router.get('/:id', async (req, res, next) => {
    try {
      const artifact = await db.getArtifact(req.params.id);
      if (!artifact) return fail(res, 'NOT_FOUND', '산출물을 찾을 수 없습니다.', 404);
      success(res, artifact);
    } catch (err) { next(err); }
  });

  // 산출물 삭제
  router.delete('/:id', async (req, res, next) => {
    try {
      await db.deleteArtifact(req.params.id);
      success(res, { deleted: true });
    } catch (err) { next(err); }
  });

  return router;
};
