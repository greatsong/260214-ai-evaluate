/**
 * 글로벌 에러 핸들러 미들웨어
 */

function errorHandler(err, req, res, _next) {
  console.error(`[${req.method} ${req.path}]`, err.message);
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' }
  });
}

module.exports = errorHandler;
