import { NextResponse } from 'next/server';

export async function POST(request) {
  const { student_id } = await request.json();

  if (!student_id) {
    return NextResponse.json({ error: 'student_id가 필요합니다.' }, { status: 400 });
  }

  const { demoStudents } = await import('@/lib/demoData');
  const student = demoStudents.find(s => s.id === student_id);

  if (!student) {
    return NextResponse.json({ error: '학생을 찾을 수 없습니다.' }, { status: 404 });
  }

  student.pin = null;

  return NextResponse.json({ success: true, name: student.name });
}
