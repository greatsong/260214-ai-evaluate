import { NextResponse } from 'next/server';

export async function POST(request) {
  const { password } = await request.json();
  const teacherPassword = process.env.TEACHER_PASSWORD;

  if (!teacherPassword) {
    // 비밀번호가 설정되지 않으면 인증 비활성화 (개발 편의)
    return NextResponse.json({ success: true, data: { authenticated: true } });
  }

  if (password === teacherPassword) {
    return NextResponse.json({ success: true, data: { authenticated: true } });
  }

  return NextResponse.json(
    { success: false, error: { code: 'AUTH_FAILED', message: '비밀번호가 올바르지 않습니다.' } },
    { status: 401 }
  );
}
