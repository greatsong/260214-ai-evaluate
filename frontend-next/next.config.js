/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
    ];
  },
  // 로컬 모드: 백엔드(Express)가 있으면 프록시
  // Vercel 모드: API Routes를 직접 사용 (rewrites 불필요)
  async rewrites() {
    // Vercel 환경에서는 자체 API Routes 사용
    if (process.env.VERCEL) {
      return [];
    }
    // 로컬 환경에서는 Express 백엔드로 프록시
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
