/**
 * 학생 관리 라우트
 */

const express = require('express');
const xlsx = require('xlsx');
const { success, fail } = require('../middleware/apiResponse');
const { validateStudent } = require('../middleware/validate');

module.exports = function (db) {
  const router = express.Router();

  // 학생 목록
  router.get('/', async (req, res, next) => {
    try {
      const students = await db.getStudents();
      success(res, students);
    } catch (err) { next(err); }
  });

  // 학생 추가
  router.post('/', validateStudent, async (req, res, next) => {
    try {
      const { student_number, name, class_name, number } = req.body;
      const studentId = await db.addStudent(student_number, name, class_name, number);
      success(res, { id: studentId, student_number, name, class_name, number }, 201);
    } catch (err) { next(err); }
  });

  // 학생 상세
  router.get('/:id', async (req, res, next) => {
    try {
      const student = await db.getStudent(req.params.id);
      if (!student) return fail(res, 'NOT_FOUND', '학생을 찾을 수 없습니다.', 404);
      success(res, student);
    } catch (err) { next(err); }
  });

  // 학생 삭제
  router.delete('/:id', async (req, res, next) => {
    try {
      await db.deleteStudent(req.params.id);
      success(res, { deleted: true });
    } catch (err) { next(err); }
  });

  // 엑셀 일괄 업로드
  router.post('/import/excel', async (req, res, next) => {
    try {
      const { fileData } = req.body;
      if (!fileData) return fail(res, 'VALIDATION_ERROR', '파일 데이터가 없습니다.');

      const buffer = Buffer.from(fileData, 'base64');
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(worksheet);

      if (rows.length === 0) return fail(res, 'VALIDATION_ERROR', '엑셀 파일에 데이터가 없습니다.');

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

      success(res, {
        total: rows.length,
        successCount: results.success.length,
        failureCount: results.failed.length,
        results,
      });
    } catch (err) { next(err); }
  });

  return router;
};
