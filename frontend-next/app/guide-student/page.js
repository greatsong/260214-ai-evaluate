'use client';
import { useState } from 'react';

const practices = [
  {
    id: 'p1',
    code: 'P1',
    title: '불편함 수집',
    color: 'blue',
    week: '1주차',
    aias: 'AI 사용 금지',
    aiasColor: 'bg-red-100 text-red-700 border-red-200',
    aiasDesc: '직접 관찰과 경험으로만 작성합니다.',
    what: '일상에서 불편한 점을 찾아서 구체적으로 기록합니다.',
    why: '좋은 프로젝트는 "진짜 문제"에서 시작합니다. 불편함을 구체적으로 관찰하는 것이 첫걸음이에요.',
    structure: '불편함 목록 → 분류 → 최종 선택 → 선택 이유',
    tips: [
      '숫자를 넣으세요: "길다" 대신 "90초", "많다" 대신 "약 40명"',
      '언제, 어디서, 얼마나 자주 겪는지 적으세요',
      '선택 이유에 "해결 가능성"도 포함하세요',
    ],
    levels: [
      { level: '탁월', example: '"7:50-8:00 정문 횡단보도, 90초 신호, 매일 약 40명 지각 위기. 분류: 시간 효율 + 고통 감소. 이유: 전교생 해당, 센서로 측정 가능"', point: '수치 포함, 다면적 분류, 해결 방안까지 제시' },
      { level: '보통', example: '"횡단보도 신호가 너무 길다. 분류: 시간 효율. 이유: 제일 불편해서"', point: '불편함은 있지만 수치 없음, 이유가 단편적' },
      { level: '미달', example: '"학교" (분류·이유 비어있음)', point: '구체화 안 됨, 작성 미완' },
    ]
  },
  {
    id: 'p2',
    code: 'P2',
    title: 'AI와 비교하기',
    color: 'emerald',
    week: '2주차',
    aias: 'AI 적극 활용',
    aiasColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    aiasDesc: 'AI를 적극적으로 사용하되, 내 발견과 비교하세요.',
    what: 'AI에게 같은 질문을 하고, 내가 찾은 것과 AI가 찾은 것을 비교합니다.',
    why: 'AI가 잘하는 것과 못하는 것을 구별하는 능력을 기릅니다. "나만 아는 것"이 핵심이에요.',
    structure: '나만 찾은 것 → AI와 비교 분석 → 최종 선택 + 이유',
    tips: [
      '"나만 찾은 것"을 강조하세요 — 우리 학교/현장만의 구체적 상황',
      'AI와 겹치는 것보다 "AI가 모르는 것"이 중요해요',
      '최종 선택 이유에 가치관이나 경험을 넣으세요',
    ],
    levels: [
      { level: '탁월', example: '"나만 찾은 것: ① 3층 남자화장실 3번 칸 문 고장 ② 매점 12:05 오픈인데 4교시 12:10 끝남 → 3분이 승부. AI는 일반적 불편함만 제시, 우리 학교 특수 상황은 모름."', point: '현장 맥락 기반 고유 발견 2개+, 구조적 비교' },
      { level: '보통', example: '"딱히 없음. AI랑 비슷했다. AI가 제안한 수면 부족을 선택. 이유: 공감돼서."', point: '고유 발견 없음, AI에 의존' },
    ]
  },
  {
    id: 'p3',
    code: 'P3',
    title: '문제 정의서',
    color: 'purple',
    week: '3-4주차',
    aias: 'AI 참고 후 비판',
    aiasColor: 'bg-blue-100 text-blue-700 border-blue-200',
    aiasDesc: 'AI 답변을 참고하되, 빠진 맥락을 찾아 비판하세요.',
    what: '7개 항목으로 문제를 체계적으로 정의합니다. AI를 활용하되, 비판적으로 분석합니다.',
    why: '"풀 수 있는 문제는 측정할 수 있는 문제"입니다. 모호한 불만을 구체적 문제로 바꾸는 훈련이에요.',
    structure: '① 문제 정의 → ② 구체성 → ③ 대상 → ④ 긴급성 → ⑤ AI 활용 → ⑥ AI 비판 → ⑦ 결정 이유',
    tips: [
      '① 문제 정의: 한 문장으로, 측정 가능한 수치 포함',
      '⑤ AI 활용: AI 답변을 그대로 복붙하지 말고 요약 + 내 상황과 연결',
      '⑥ 비판적 사고 (가장 중요!): "AI가 모르는 우리 학교/상황의 구체적 맥락"을 찾으세요',
      '⑦ 결정 이유: "불편해서"가 아니라, 가치관·경험·실현 가능성을 담으세요',
    ],
    levels: [
      { level: '탁월', example: '"문제: 4교시 종료(12:10)와 급식(12:00)의 10분 차이로 240명이 평균 15분 대기. AI 비판: 모바일 주문은 폰 사용 금지 규정상 불가(AI가 모름), 단일 메뉴 체계라 분산 불가."', point: '수치 포함, AI 맥락 빈틈 2개+ 지적' },
      { level: '보통', example: '"문제: 급식 줄이 길다. AI 비판: 잘 모르겠다, 다 맞는 것 같다. 이유: 매일 먹으니까."', point: '수치 없음, AI 비판 없음' },
    ]
  },
  {
    id: 'p4',
    code: 'P4',
    title: 'AI 활용 일지',
    color: 'amber',
    week: '5-8주차 (상시)',
    aias: 'AI 전면 사용 + 기록',
    aiasColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    aiasDesc: 'AI를 자유롭게 사용하되, 모든 과정을 기록하세요.',
    what: '프로젝트 진행 중 AI를 사용할 때마다 5가지 항목을 기록합니다.',
    why: '가장 중요한 평가 자료입니다. AI를 "받아 쓰는" 것이 아니라 "검토하고 판단하는" 과정을 보여주세요.',
    structure: 'AI에게 뭘 물었나 → AI가 뭘 줬나 → 내가 뭘 바꿨나 → AI의 문제점 → 내 결정',
    tips: [
      '프롬프트를 구체적으로: "코드 써줘" 대신 구체적 조건(핀 번호, 라이브러리, 출력 형태)을 명시',
      '"뭘 바꿨나"에 뭘 + 왜 + 기술적 근거를 쓰세요',
      '"문제점" (가장 중요!): AI가 모르는 우리 환경의 한계를 찾으세요',
      '시간이 지나면서 일지가 점점 구체적으로 변하는 것이 성장의 증거입니다',
    ],
    levels: [
      { level: '탁월', example: '"프롬프트: Pico W에서 DHT22→SH1106 OLED, GP16, I2C(GP0,GP1), 2초 간격. 수정: ① ssd1306→sh1106 변경 ② try-except 추가 ③ 한글+단위. 문제점: SSD1306/SH1106 호환 안됨, 에러처리 누락, I2C 주소 하드코딩. 결정: 28도 이상 경고 추가(학교 냉방 기준 참고)."', point: '조건 완전 명시, 수정 이유+근거, 구조적 한계 분석' },
      { level: '보통', example: '"물었나: 온도 센서 코드. 줬나: 코드. 바꿨나: 조금 바꿈. 문제점: 좀 안 맞는 부분. 결정: AI 거에서 수정해서 씀."', point: '내용이 모호, 근거 없음' },
    ]
  },
  {
    id: 'p7',
    code: 'P7',
    title: '성장 성찰문',
    color: 'teal',
    week: '학기말',
    aias: 'AI 사용 금지',
    aiasColor: 'bg-red-100 text-red-700 border-red-200',
    aiasDesc: '자기 경험과 성장을 직접 돌아보며 작성합니다.',
    what: '한 학기를 돌아보며 4가지 영역에서 자신의 변화를 분석합니다.',
    why: '"많이 배웠습니다"는 성찰이 아닙니다. 구체적 근거(날짜, 원문)를 인용하며 변화를 보여주세요.',
    structure: '① 문제 발견 능력 변화 → ② AI 협업 방식 변화 → ③ 가장 중요한 결정 → ④ 나는 어떤 사람인가',
    tips: [
      '첫 산출물과 마지막 산출물을 직접 인용하며 비교하세요 (날짜 포함)',
      'AI 활용 일지 초반 vs 후반을 번호/날짜와 함께 비교하세요',
      '"가장 중요한 결정"에는 상황 + AI 제안 + 내 선택 + 이유 + 결과를 모두 쓰세요',
      '"나는 어떤 문제에 끌리는 사람인가"까지 도달하면 최고입니다',
    ],
    levels: [
      { level: '탁월', example: '"첫 정의서(3/5): \'급식 줄이 길다\' → 마지막(5/20): \'4교시 종료 12:10, 240명, 15분 대기\'. 달라진 것: 숫자가 들어갔다. AI 일지 #1(3/12): \'코드 써줘, 안 바꿈, 없음\' → #8(5/15): \'구체적 조건 명시, 보안·에러처리 추가, 구조적 한계 3가지\'. 3월에는 받았고 5월에는 검토했다."', point: '날짜+원문 인용, 질적 변화 분석' },
      { level: '보통', example: '"처음보다 나아졌다. AI를 더 잘 쓰게 되었다. 잘 모르겠다. 여러 가지에 관심이 있다."', point: '변화 인식은 있으나 근거·인용 없음' },
    ]
  },
];

export default function StudentGuidePage() {
  const [activePractice, setActivePractice] = useState('p1');
  const current = practices.find(p => p.id === activePractice);

  const colorMap = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-600', light: 'bg-blue-100' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', badge: 'bg-emerald-600', light: 'bg-emerald-100' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', badge: 'bg-purple-600', light: 'bg-purple-100' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', badge: 'bg-amber-600', light: 'bg-amber-100' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800', badge: 'bg-teal-600', light: 'bg-teal-100' },
  };
  const c = colorMap[current.color];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* 헤더 */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800">실천 활동 작성 가이드</h1>
            <p className="text-xs text-slate-500 mt-0.5">잘 쓰는 법을 알면, 더 좋은 평가를 받을 수 있어요.</p>
          </div>
          <div className="flex gap-3 text-xs">
            <a href="/submit" className="bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700">산출물 제출</a>
            <a href="/submit/my" className="text-blue-600 hover:underline flex items-center">내 제출 확인</a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* 핵심 원칙 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white">
          <h2 className="text-lg font-bold mb-3">이 수업에서 가장 중요한 3가지</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { title: 'AI는 도구, 결정은 나', desc: 'AI가 답을 줘도, 최종 판단과 선택은 내가 합니다. 이 "결정의 순간"이 평가됩니다.' },
              { title: '숫자를 넣으세요', desc: '"길다" 대신 "90초", "많다" 대신 "약 40명". 측정할 수 있는 문제가 풀 수 있는 문제입니다.' },
              { title: '과정이 중요해요', desc: 'AI가 만든 결과물이 아니라, AI를 어떻게 활용했는지, 뭘 바꿨고 왜 바꿨는지가 중요합니다.' },
            ].map((item, i) => (
              <div key={i} className="bg-white bg-opacity-15 rounded-xl p-4">
                <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-xs leading-relaxed opacity-90">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 왜 이런 과제인지 FAQ */}
        <div className="bg-white rounded-2xl border p-6 mb-8">
          <h2 className="text-base font-bold text-slate-800 mb-4">자주 묻는 질문</h2>
          <div className="space-y-4">
            <details className="group">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-2">
                <span className="text-blue-500 group-open:rotate-90 transition-transform">&#9654;</span>
                AI한테 시키면 되는데, 왜 직접 써야 하나요?
              </summary>
              <div className="mt-2 ml-5 text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4">
                <p className="mb-2">
                  실제 연구 결과, AI(ChatGPT)는 대학 시험 문제의 <strong>65.8%</strong>를 풀 수 있습니다
                  <span className="text-xs text-slate-400"> (Borges 외, 2024, PNAS)</span>.
                  하지만 AI가 풀 수 있는 문제는 <strong>단순 지식 확인</strong> 문제가 대부분이에요.
                </p>
                <p className="mb-2">
                  이 수업의 과제는 AI가 대신할 수 <strong>없는</strong> 것들로 구성되어 있어요:
                  여러분의 <strong>직접 경험</strong>, <strong>현장 관찰</strong>, <strong>판단 과정</strong>, 그리고 <strong>성장 변화</strong>.
                  AI는 여러분의 학교 화장실이 몇 층에서 고장 났는지 모릅니다.
                </p>
                <p className="text-xs text-slate-500">
                  즉, AI를 &quot;못 쓰게&quot; 하는 것이 아니라, AI가 &quot;할 수 없는 것&quot;을 여러분이 하는 거예요.
                </p>
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-2">
                <span className="text-blue-500 group-open:rotate-90 transition-transform">&#9654;</span>
                각 실천에서 AI를 어디까지 써도 되나요?
              </summary>
              <div className="mt-2 ml-5 text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4">
                <p className="mb-3">실천마다 AI 사용 범위가 다릅니다. 각 탭의 뱃지를 확인하세요:</p>
                <div className="space-y-2">
                  {practices.map(p => (
                    <div key={p.id} className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${p.aiasColor}`}>{p.aias}</span>
                      <span className="text-xs text-slate-500">{p.code}: {p.title} — {p.aiasDesc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-2">
                <span className="text-blue-500 group-open:rotate-90 transition-transform">&#9654;</span>
                AI가 대신 써주면 왜 점수가 낮아지나요?
              </summary>
              <div className="mt-2 ml-5 text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4">
                <p className="mb-2">
                  이 수업의 루브릭(채점 기준)은 <strong>결과물의 완성도</strong>가 아니라
                  <strong> 사고의 과정</strong>을 평가합니다.
                </p>
                <p className="mb-2">
                  예를 들어, P3 문제 정의서에서 &quot;비판적 사고&quot; 항목은
                  <strong> &quot;AI가 모르는 구체적 맥락을 지적하고, 왜 AI가 이걸 모르는지 설명&quot;</strong>해야 높은 점수를 받아요.
                  AI가 대신 쓰면 이 항목에서 점수를 받을 수 없습니다.
                </p>
                <p className="text-xs text-slate-500">
                  AI가 아무리 잘 써도 &quot;나만 아는 것&quot;, &quot;내가 판단한 이유&quot;, &quot;내가 바꾼 근거&quot;는 AI가 만들어낼 수 없어요.
                  바로 그것이 평가의 핵심입니다.
                </p>
              </div>
            </details>
          </div>
        </div>

        {/* 실천 활동 탭 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {practices.map(p => (
            <button key={p.id} onClick={() => setActivePractice(p.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activePractice === p.id
                  ? `${colorMap[p.color].badge} text-white`
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {p.code}: {p.title}
            </button>
          ))}
        </div>

        {/* 선택된 실천 활동 상세 */}
        <div className="space-y-6">
          {/* 개요 */}
          <div className={`${c.bg} border ${c.border} rounded-2xl p-6`}>
            <div className="flex items-center gap-3 mb-3">
              <span className={`${c.badge} text-white text-xs font-black px-3 py-1 rounded-full`}>{current.code}</span>
              <h2 className={`text-xl font-bold ${c.text}`}>{current.title}</h2>
              <span className="text-xs text-slate-500 bg-white rounded-full px-3 py-1">{current.week}</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${current.aiasColor}`}>{current.aias}</span>
            </div>
            <p className={`text-sm ${c.text} mb-4`}>{current.what}</p>
            <div className="bg-white bg-opacity-60 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 mb-1">왜 중요한가요?</p>
              <p className="text-sm text-slate-700">{current.why}</p>
            </div>
          </div>

          {/* 구조 */}
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-bold text-sm mb-3">작성 구조</h3>
            <div className={`${c.light} rounded-xl p-4 text-sm font-medium ${c.text}`}>
              {current.structure}
            </div>
          </div>

          {/* 잘 쓰는 팁 */}
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-bold text-sm mb-3">잘 쓰는 팁</h3>
            <div className="space-y-2">
              {current.tips.map((tip, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full ${c.badge} text-white text-xs flex items-center justify-center font-bold`}>{i + 1}</span>
                  <p className="text-sm text-slate-700 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 수준별 예시 */}
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-bold text-sm mb-4">이렇게 쓰면 이런 점수를 받아요</h3>
            <div className="space-y-4">
              {current.levels.map((item, i) => (
                <div key={i} className={`border-2 rounded-xl p-4 ${
                  item.level === '탁월' ? 'border-emerald-300 bg-emerald-50' :
                  item.level === '보통' ? 'border-amber-300 bg-amber-50' :
                  'border-red-300 bg-red-50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      item.level === '탁월' ? 'bg-emerald-200 text-emerald-800' :
                      item.level === '보통' ? 'bg-amber-200 text-amber-800' :
                      'bg-red-200 text-red-800'
                    }`}>{item.level}</span>
                    <span className="text-xs text-slate-500">{item.point}</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-sm text-slate-700 leading-relaxed">
                    {item.example}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 CTA */}
        <div className="mt-8 text-center">
          <a href="/submit" className="inline-block bg-blue-600 text-white rounded-xl px-8 py-3 font-semibold hover:bg-blue-700 transition-colors">
            산출물 제출하러 가기
          </a>
        </div>
      </div>
    </div>
  );
}
