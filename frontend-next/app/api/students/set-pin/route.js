import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const { student_number, pin } = body;

  if (!student_number) {
    return NextResponse.json({ error: '학번이 필요합니다.' }, { status: 400 });
  }

  if (!pin || pin.length < 4) {
    return NextResponse.json({ error: '비밀번호는 4자리 이상이어야 합니다.' }, { status: 400 });
  }

  const { demoStudents } = await import('@/lib/demoData');
  const student = demoStudents.find(s => s.student_number === student_number);

  if (!student) {
    return NextResponse.json({ error: '해당 학번의 학생을 찾을 수 없습니다.' }, { status: 404 });
  }

  if (student.pin) {
    return NextResponse.json({ error: '이미 비밀번호가 설정되어 있습니다.' }, { status: 409 });
  }

  // 비밀번호 설정
  student.pin = pin;

  return NextResponse.json({
    id: student.id,
    name: student.name,
    class_name: student.class_name,
    number: student.number,
    has_pin: true,
    verified: true,
  });
}
