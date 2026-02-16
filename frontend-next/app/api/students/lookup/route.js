import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const studentNumber = searchParams.get('number');
  const pin = searchParams.get('pin');

  if (!studentNumber) {
    return NextResponse.json({ error: '학번(number)이 필요합니다.' }, { status: 400 });
  }

  if (!pin) {
    return NextResponse.json({ error: '비밀번호(pin)가 필요합니다.' }, { status: 400 });
  }

  // Vercel 모드에서는 데모 데이터에서 조회
  const { demoStudents } = await import('@/lib/demoData');
  const student = demoStudents.find(s => s.student_number === studentNumber);

  if (!student) {
    return NextResponse.json({ error: '해당 학번의 학생을 찾을 수 없습니다.' }, { status: 404 });
  }

  if (student.pin !== pin) {
    return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
  }

  return NextResponse.json({
    id: student.id,
    name: student.name,
    class_name: student.class_name,
    number: student.number
  });
}
