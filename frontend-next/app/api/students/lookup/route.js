import { NextResponse } from 'next/server';
import { ensureDB } from '@/lib/dbInit';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const studentNumber = searchParams.get('number');
  const pin = searchParams.get('pin');

  if (!studentNumber) {
    return NextResponse.json({ error: '학번(number)이 필요합니다.' }, { status: 400 });
  }

  const db = await ensureDB();
  let student;

  if (!db) {
    const { demoStudents } = await import('@/lib/demoData');
    student = demoStudents.find(s => s.student_number === studentNumber);
  } else {
    const result = await db.execute({
      sql: 'SELECT * FROM students WHERE student_number = ?',
      args: [studentNumber],
    });
    student = result.rows[0] || null;
  }

  if (!student) {
    return NextResponse.json({ error: '해당 학번의 학생을 찾을 수 없습니다.' }, { status: 404 });
  }

  // pin 파라미터가 없으면: 기본 정보 + 비밀번호 설정 여부만
  if (!pin) {
    return NextResponse.json({
      id: student.id,
      name: student.name,
      class_name: student.class_name,
      has_pin: !!student.pin,
    });
  }

  // pin 파라미터가 있으면: 비밀번호 검증
  if (!student.pin) {
    return NextResponse.json({ error: '비밀번호가 설정되지 않았습니다. 먼저 비밀번호를 설정하세요.' }, { status: 400 });
  }

  if (student.pin !== pin) {
    return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
  }

  return NextResponse.json({
    id: student.id,
    name: student.name,
    class_name: student.class_name,
    number: student.number,
    has_pin: true,
    verified: true,
  });
}
