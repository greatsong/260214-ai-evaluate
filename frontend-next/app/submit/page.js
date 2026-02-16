'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { addArtifact } from '@/lib/api';
import { PRACTICE_TYPES } from '@/lib/constants';

function SubmitForm() {
  const searchParams = useSearchParams();
  const presetType = searchParams.get('type') || '';
  const presetSession = searchParams.get('session') || '';
  const presetDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [studentNumber, setStudentNumber] = useState('');
  const [student, setStudent] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [lookingUp, setLookingUp] = useState(false);

  const [practiceType, setPracticeType] = useState(presetType);
  const [session, setSession] = useState(presetSession);
  const [date, setDate] = useState(presetDate);
  const [rawText, setRawText] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const hasPreset = !!searchParams.get('type');

  const lookupStudent = async () => {
    if (!studentNumber || studentNumber.length < 3) return;
    setLookingUp(true);
    setLookupError('');
    setStudent(null);
    try {
      const res = await fetch(`/api/students/lookup?number=${studentNumber}`);
      const data = await res.json();
      if (res.ok) {
        setStudent(data);
      } else {
        setLookupError(data.error || '학생을 찾을 수 없습니다.');
      }
    } catch {
      setLookupError('조회 중 오류가 발생했습니다.');
    } finally {
      setLookingUp(false);
    }
  };

  useEffect(() => {
    if (studentNumber.length >= 5) {
      lookupStudent();
    } else {
      setStudent(null);
      setLookupError('');
    }
  }, [studentNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student || !practiceType || !rawText.trim()) return;

    try {
      setSubmitting(true);
      await addArtifact({
        student_id: student.id,
        practice_type: practiceType,
        raw_text: rawText.trim(),
        date,
        session: session || undefined
      });
      setSubmitted(true);
    } catch (err) {
      alert('제출 오류: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setRawText('');
    setSubmitted(false);
    if (!hasPreset) {
      setPracticeType('');
      setSession('');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold mb-2">제출 완료!</h2>
          <p className="text-sm text-slate-500 mb-1">{student.name} ({student.class_name})</p>
          <p className="text-sm text-slate-500 mb-6">{PRACTICE_TYPES[practiceType]}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleReset}
              className="bg-blue-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-blue-700">
              추가 제출
            </button>
            <a href="/submit/my" className="bg-slate-100 text-slate-700 rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-slate-200">
              내 제출 확인
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 헤더 */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800">AI 실천 평가 - 산출물 제출</h1>
            {hasPreset && PRACTICE_TYPES[presetType] && (
              <p className="text-sm text-blue-600 mt-0.5">
                {PRACTICE_TYPES[presetType]} {presetSession && `| ${presetSession}`}
              </p>
            )}
          </div>
          <div className="flex gap-3 text-xs">
            <a href="/submit/my" className="text-blue-600 hover:underline">내 제출 확인</a>
            <a href="/guide-student" className="text-slate-500 hover:underline">작성 가이드</a>
          </div>
        </div>
      </header>

      {/* 폼 */}
      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 학번 입력 */}
          <div className="bg-white rounded-xl border p-5">
            <label className="text-sm font-semibold text-slate-700 block mb-2">학번</label>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={studentNumber}
                onChange={e => setStudentNumber(e.target.value)}
                placeholder="학번 입력 (예: 10101)"
                className="border rounded-lg px-4 py-2.5 text-sm flex-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                autoFocus
              />
              {lookingUp && <span className="text-xs text-slate-400">조회 중...</span>}
              {student && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-sm">
                  <span className="font-semibold text-emerald-800">{student.name}</span>
                  <span className="text-emerald-600 ml-2 text-xs">{student.class_name}</span>
                </div>
              )}
              {lookupError && (
                <span className="text-xs text-red-500">{lookupError}</span>
              )}
            </div>
          </div>

          {/* 실천 유형 (프리셋 없을 때만 선택) */}
          {!hasPreset && (
            <div className="bg-white rounded-xl border p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">실천 유형</label>
                  <select value={practiceType} onChange={e => setPracticeType(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 outline-none">
                    <option value="">선택하세요</option>
                    {Object.entries(PRACTICE_TYPES).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">차시 (선택)</label>
                  <input type="text" value={session} onChange={e => setSession(e.target.value)}
                    placeholder="예: 8차시"
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* 산출물 입력 */}
          <div className="bg-white rounded-xl border p-5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700">산출물 내용</label>
              <span className="text-xs text-slate-400">{rawText.length}자</span>
            </div>
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder={getPlaceholder(practiceType)}
              rows={14}
              className="w-full border rounded-lg px-4 py-3 text-sm leading-relaxed resize-y focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
            />
            {rawText.length > 0 && rawText.length < 10 && (
              <p className="text-xs text-amber-600 mt-1">최소 10자 이상 작성해주세요.</p>
            )}
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={!student || !practiceType || rawText.trim().length < 10 || submitting}
            className="w-full bg-blue-600 text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? '제출 중...' : '제출하기'}
          </button>
        </form>
      </div>
    </div>
  );
}

function getPlaceholder(type) {
  const placeholders = {
    p1_discomfort: '일상에서 발견한 불편함을 구체적으로 적어주세요.\n\n예시:\n- 어디에서, 언제, 얼마나 자주 겪는 불편함인지\n- 몇 명이 영향을 받는지\n- 왜 이 불편함을 선택했는지',
    p2_comparison: 'AI에게 같은 질문을 하고, 비교한 결과를 적어주세요.\n\n[나만 찾은 것]\n[AI가 찾은 것]\n[비교 분석]\n[최종 선택과 이유]',
    p3_definition: '7개 항목에 따라 문제를 정의해주세요.\n\n1. 문제는 무엇인가?\n2. 구체적으로 설명하면?\n3. 누구에게 문제인가?\n4. 왜 지금 풀어야 하는가?\n5. AI는 이 문제에 대해 뭐라고 하나?\n6. AI 답변에서 빠진 것은?\n7. 내가 이 문제를 고른 이유는?',
    p4_ai_log: 'AI 활용 일지를 작성해주세요.\n\nAI에게 뭘 물었나?\nAI가 뭘 줬나?\n내가 뭘 바꿨나?\nAI 답변의 문제점?\n내가 결정한 것은?',
    p7_reflection: '한 학기를 돌아보며 성장 성찰문을 작성해주세요.\n\n[영역 1] 문제 발견 능력의 변화\n[영역 2] AI와의 협업 방식의 변화\n[영역 3] 가장 중요한 결정\n[영역 4] 나는 어떤 문제에 끌리는 사람인가?',
  };
  return placeholders[type] || '산출물 내용을 입력해주세요.\n\n구체적으로, 수치를 포함하여 작성하면 좋은 평가를 받을 수 있습니다.';
}

export default function SubmitPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">로딩 중...</p>
      </div>
    }>
      <SubmitForm />
    </Suspense>
  );
}
