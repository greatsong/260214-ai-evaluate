'use client';
import { useState } from 'react';

const sections = [
  {
    id: 'philosophy',
    title: '교육 철학',
    icon: '💡',
    content: () => (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">AI 시대, 왜 이 수업인가?</h3>
          <p className="text-sm text-blue-800 leading-relaxed mb-4">
            이 시스템은 단순히 "AI로 채점하는 도구"가 아닙니다.
            학생이 AI와 협업하면서 <strong>비판적 사고력, 자기 결정력, 문제 발견 능력</strong>을
            기르는 과정을 체계적으로 평가하고 피드백하는 시스템입니다.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'AI는 제안 OK, 결정은 X', desc: 'AI가 답을 줄 수 있지만, 최종 판단과 선택은 학생이 합니다. 이 "결정의 순간"이 평가의 핵심입니다.' },
              { title: '같이 배운다 = 같은 어려움을 겪는 것', desc: '공유된 경험이 관계의 재료입니다. 모둠 내에서 같은 문제를 함께 고민하는 과정을 중시합니다.' },
              { title: '자기 이해에서 시작', desc: '교육의 목적은 자아발견과 자아실현입니다. 학생이 "나는 어떤 문제에 끌리는 사람인가?"를 알아가는 여정입니다.' },
              { title: '과정을 본다, 결과물이 아니라', desc: 'AI가 만든 결과물은 학생 역량의 증거가 아닙니다. AI를 어떻게 활용했는지, 뭘 바꿨는지가 중요합니다.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="font-semibold text-sm text-blue-900 mb-2">{item.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-bold mb-4">FACT 평가 프레임워크</h3>
          <p className="text-sm text-slate-600 mb-4">
            학생의 AI 활용 역량을 4가지 축으로 종합 평가합니다. 포트폴리오 페이지에서 자동으로 분석됩니다.
          </p>
          <div className="grid grid-cols-4 gap-3">
            {[
              { letter: 'F', name: 'Feasibility', korean: '실현력', desc: '아이디어를 실제로 구현하는 능력', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', practices: '실천 3, 4' },
              { letter: 'A', name: 'AI Literacy', korean: 'AI 리터러시', desc: 'AI를 비판적으로 활용하는 능력', color: 'bg-blue-50 border-blue-200 text-blue-800', practices: '실천 2, 4' },
              { letter: 'C', name: 'Critical Thinking', korean: '비판적 사고', desc: '정보를 분석·평가·종합하는 능력', color: 'bg-purple-50 border-purple-200 text-purple-800', practices: '실천 2, 3, 7' },
              { letter: 'T', name: 'Teamwork', korean: '협업·소통', desc: '아이디어 공유 및 피드백 수용력', color: 'bg-amber-50 border-amber-200 text-amber-800', practices: '실천 6, 7' },
            ].map((item, i) => (
              <div key={i} className={`rounded-lg p-4 border ${item.color}`}>
                <div className="text-2xl font-black mb-1">{item.letter}</div>
                <div className="text-xs font-medium mb-1">{item.name}</div>
                <div className="text-sm font-semibold mb-2">{item.korean}</div>
                <p className="text-xs leading-relaxed mb-2">{item.desc}</p>
                <div className="text-xs opacity-70">관련: {item.practices}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'flow',
    title: '학기 운영 흐름',
    icon: '📅',
    content: () => (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-bold mb-4">한 학기 실천 활동 로드맵</h3>
          <div className="relative">
            {[
              { week: '1주차', practice: '실천 1: 불편함 수집', desc: '일상의 불편함을 관찰하고, 구체적으로 기록하고, 분류합니다.', color: 'border-blue-400 bg-blue-50', tip: '학생들이 "학교"처럼 추상적으로 쓰지 않도록, 수치(몇 명, 몇 분, 몇 번)를 넣으라고 안내하세요.' },
              { week: '2주차', practice: '실천 2: AI와 비교하기', desc: 'AI에게 같은 질문을 하고, 내가 찾은 것과 비교합니다.', color: 'border-emerald-400 bg-emerald-50', tip: '"AI와 겹치는 것"보다 "나만 찾은 것"이 핵심입니다. 현장 맥락(우리 학교만의 상황)을 강조하세요.' },
              { week: '3-4주차', practice: '실천 3: 문제 정의서', desc: '7개 항목으로 문제를 체계적으로 정의합니다. AI 비판적 분석 포함.', color: 'border-purple-400 bg-purple-50', tip: '가장 중요한 항목은 6번(비판적 사고)입니다. "AI가 모르는 것"을 찾게 하세요.' },
              { week: '5-8주차', practice: '실천 4: AI 활용 일지 (상시)', desc: '프로젝트 진행 중 AI를 사용할 때마다 기록합니다.', color: 'border-amber-400 bg-amber-50', tip: '가장 중요한 평가 자료입니다. "뭘 바꿨는지 + 왜 바꿨는지"를 반드시 쓰게 하세요. 시간에 따른 성장이 핵심.' },
              { week: '중간 2회', practice: '실천 6: 공유 실패 루틴', desc: '모둠 내에서 실패 경험과 배운 점을 공유합니다.', color: 'border-rose-400 bg-rose-50', tip: '실패를 부정적으로 보지 않는 분위기를 만드세요. "실패에서 뭘 배웠는지"가 중요합니다.' },
              { week: '발표', practice: '실천 5: 3분 구술 면접', desc: 'AI 없이 자기 프로젝트를 설명합니다.', color: 'border-indigo-400 bg-indigo-50', tip: 'AI 도움 없이 핵심 개념을 설명할 수 있는지 확인합니다. FACT의 F(기초역량)와 C(개념적 이해)를 평가합니다.' },
              { week: '학기말', practice: '실천 7: 성장 성찰문', desc: '한 학기 전체를 돌아보며 자기 변화를 분석합니다.', color: 'border-teal-400 bg-teal-50', tip: '첫 산출물과 마지막 산출물을 직접 인용하며 비교하게 하세요. 날짜와 원문 인용이 핵심입니다.' },
            ].map((item, i) => (
              <div key={i} className={`border-l-4 ${item.color} rounded-r-lg p-4 mb-4`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold bg-white rounded-full px-3 py-1 border">{item.week}</span>
                  <span className="font-semibold text-sm">{item.practice}</span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{item.desc}</p>
                <div className="bg-white bg-opacity-60 rounded p-2">
                  <span className="text-xs font-semibold text-slate-500">교사 Tip: </span>
                  <span className="text-xs text-slate-700">{item.tip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'rubric',
    title: '루브릭 해설',
    icon: '📋',
    content: () => (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-bold mb-2">평가 기준 상세 해설</h3>
          <p className="text-sm text-slate-500 mb-6">각 실천 활동의 평가 항목과 수준별 기준입니다. AI 평가 시 이 루브릭이 시스템 프롬프트로 사용됩니다.</p>

          {/* 실천 1 */}
          <div className="mb-8">
            <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 rounded-full w-7 h-7 flex items-center justify-center text-xs font-black">P1</span>
              실천 1: 불편함 수집 (만점 12점)
            </h4>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border p-2 text-left w-24">항목</th>
                  <th className="border p-2 text-center bg-emerald-50">탁월 (4)</th>
                  <th className="border p-2 text-center bg-blue-50">우수 (3)</th>
                  <th className="border p-2 text-center bg-amber-50">보통 (2)</th>
                  <th className="border p-2 text-center bg-red-50">미달 (1)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 font-medium">구체성</td>
                  <td className="border p-2">시간·장소·빈도·영향 명확</td>
                  <td className="border p-2">상황 구체적이나 수치 부족</td>
                  <td className="border p-2">존재하지만 모호</td>
                  <td className="border p-2">한 단어 수준</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">분류 적절성</td>
                  <td className="border p-2">이유 설명 가능, 다면적</td>
                  <td className="border p-2">대체로 적절</td>
                  <td className="border p-2">근거 불명확</td>
                  <td className="border p-2">시도 안 함</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">선택 이유</td>
                  <td className="border p-2">경험+영향+해결가능성</td>
                  <td className="border p-2">한 측면만</td>
                  <td className="border p-2">"제일 불편해서"</td>
                  <td className="border p-2">미작성</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 실천 3 */}
          <div className="mb-8">
            <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
              <span className="bg-purple-100 rounded-full w-7 h-7 flex items-center justify-center text-xs font-black">P3</span>
              실천 3: 문제 정의서 (만점 28점) — 7개 항목
            </h4>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border p-2 text-left w-24">항목</th>
                  <th className="border p-2 text-center bg-emerald-50">탁월 (4)</th>
                  <th className="border p-2 text-center bg-blue-50">우수 (3)</th>
                  <th className="border p-2 text-center bg-amber-50">보통 (2)</th>
                  <th className="border p-2 text-center bg-red-50">미달 (1)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['문제 정의', '한 문장, 측정 가능', '명확하나 측정 부족', '모호하나 방향 있음', '매우 추상적'],
                  ['구체성', '시간·장소·빈도·수치 모두', '일부 수치', '서술적, 수치 없음', '한 줄 미만'],
                  ['대상 인식', '범위+특성 구체적', '명시하나 구체성 부족', '"학생들" 수준', '미작성'],
                  ['긴급성', '논리적 결과 서술', '결과 언급, 논리 부족', '"불편하니까"', '미작성'],
                  ['AI 활용', '요약+맥락 연결', '요약, 맥락 부족', '단순 복붙', '미사용'],
                  ['비판적 사고 ★', '맥락 2개+ 빠진 것+이유', '1개 빈틈+설명', '"좀 다른 것 같다"', '"없음"'],
                  ['결정 이유', '가치관/경험 기반', '한 측면만', '"그냥 이게 좋아서"', '미작성'],
                ].map(([name, ...levels], i) => (
                  <tr key={i} className={name.includes('★') ? 'bg-yellow-50' : ''}>
                    <td className="border p-2 font-medium">{name}</td>
                    {levels.map((l, j) => <td key={j} className="border p-2">{l}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-amber-700 mt-2">★ 비판적 사고는 핵심 항목입니다. "AI가 모르는 구체적 맥락"을 찾는 능력을 봅니다.</p>
          </div>

          {/* 실천 4 */}
          <div className="mb-8">
            <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
              <span className="bg-amber-100 rounded-full w-7 h-7 flex items-center justify-center text-xs font-black">P4</span>
              실천 4: AI 활용 일지 (만점 20점) — 가장 중요한 평가 자료
            </h4>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border p-2 text-left w-24">항목</th>
                  <th className="border p-2 text-center bg-emerald-50">탁월 (4)</th>
                  <th className="border p-2 text-center bg-blue-50">우수 (3)</th>
                  <th className="border p-2 text-center bg-amber-50">보통 (2)</th>
                  <th className="border p-2 text-center bg-red-50">미달 (1)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['프롬프트 구체성', '맥락·조건·형태 명시', '구체적, 일부 누락', '"코드 써줘"', '미기록'],
                  ['AI 결과 요약', '핵심 구조 파악', '요약, 구조 파악 부족', '"코드 줬음"', '미기록'],
                  ['수정 내용', '뭘+왜+기술적 근거', '뭘 바꿨는지만', '"조금 바꿈"', '미기록'],
                  ['문제점 인식 ★', '구조적 한계+맥락 연결', '1개 지적', '"좀 이상함"', '"없음"'],
                  ['자기 결정', '목적 기반+근거', '결정, 근거 부족', '"AI 따라함"', '미기록'],
                ].map(([name, ...levels], i) => (
                  <tr key={i} className={name.includes('★') ? 'bg-yellow-50' : ''}>
                    <td className="border p-2 font-medium">{name}</td>
                    {levels.map((l, j) => <td key={j} className="border p-2">{l}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-amber-700 mt-2">★ 문제점 인식은 핵심 항목입니다. AI 코드의 구조적 한계를 지적하고 "우리 환경"과 연결하는 능력을 봅니다.</p>
          </div>

          {/* 실천 7 */}
          <div>
            <h4 className="font-bold text-teal-800 mb-3 flex items-center gap-2">
              <span className="bg-teal-100 rounded-full w-7 h-7 flex items-center justify-center text-xs font-black">P7</span>
              실천 7: 성장 성찰문 (만점 16점)
            </h4>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border p-2 text-left w-24">항목</th>
                  <th className="border p-2 text-center bg-emerald-50">탁월 (4)</th>
                  <th className="border p-2 text-center bg-blue-50">우수 (3)</th>
                  <th className="border p-2 text-center bg-amber-50">보통 (2)</th>
                  <th className="border p-2 text-center bg-red-50">미달 (1)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['문제 발견 변화', '날짜·원문 인용, 질적 분석', '인식하나 인용 부족', '"나아졌다"', '"많이 배웠습니다"'],
                  ['AI 협업 변화', '일지 번호 인용, 질적 전환', '인식하나 인용 부족', '"더 잘 쓰게 됨"', '"도움이 많이 됨"'],
                  ['중요한 결정', '상황+AI제안+선택+이유+결과', '결정+이유, 비교 부족', '"잘 모르겠다"', '미작성'],
                  ['자기 이해', '패턴분석+관심사+진로', '관심사 인식, 깊이 부족', '"여러 가지에 관심"', '미작성'],
                ].map(([name, ...levels], i) => (
                  <tr key={i}>
                    <td className="border p-2 font-medium">{name}</td>
                    {levels.map((l, j) => <td key={j} className="border p-2">{l}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'howto',
    title: '시스템 사용법',
    icon: '🖥️',
    content: () => (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-bold mb-4">시스템 사용 흐름</h3>
          <div className="space-y-4">
            {[
              { step: 1, title: '학생 등록', page: '학생 관리', desc: '학생 이름과 학급 정보를 입력합니다. Excel 파일 업로드도 가능합니다.', icon: '👥' },
              { step: 2, title: '산출물 입력', page: '산출물 입력', desc: '학생이 작성한 텍스트(문제 정의서, AI 활용 일지 등)를 실천 유형과 함께 입력합니다.', icon: '📝' },
              { step: 3, title: 'AI 평가 수행', page: '개별 평가', desc: '산출물을 선택하고 "AI 평가 수행" 버튼을 누르면, 루브릭에 따라 항목별 점수와 피드백이 생성됩니다.', icon: '⭐' },
              { step: 4, title: '성장 분석', page: '성장 분석', desc: '같은 학생의 같은 유형 산출물 2개 이상을 비교하여 시간에 따른 성장 궤적을 분석합니다.', icon: '📈' },
              { step: 5, title: '포트폴리오 종합', page: '포트폴리오', desc: 'FACT 프레임워크로 학기 전체를 종합 평가하고, 생기부 교과 세특 초안까지 생성합니다.', icon: '🎯' },
              { step: 6, title: '학급 현황 확인', page: '학급 현황', desc: '학급 전체의 실천별 평가 현황을 히트맵으로 한눈에 파악합니다.', icon: '📊' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div className="flex-1 bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{item.title}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5">{item.icon} {item.page}</span>
                  </div>
                  <p className="text-xs text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-bold text-amber-900 mb-3">데모 모드 안내</h3>
          <p className="text-sm text-amber-800 mb-3">
            처음 접속하면 <strong>데모 모드 ON</strong> 상태입니다. 5명의 샘플 학생과 11개 산출물,
            7개 평가 결과로 전체 기능을 미리 체험할 수 있습니다.
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white rounded p-3">
              <strong className="text-amber-700">데모 ON</strong>
              <p className="text-slate-600 mt-1">샘플 데이터로 기능 체험. API 호출 없음. 비용 없음.</p>
            </div>
            <div className="bg-white rounded p-3">
              <strong className="text-amber-700">데모 OFF</strong>
              <p className="text-slate-600 mt-1">실제 데이터 사용. AI 평가 시 Claude API 호출. 비용 발생.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold mb-3">AI 평가의 한계와 교사의 역할</h3>
          <div className="space-y-3">
            {[
              { title: 'AI 평가는 "초안"입니다', desc: 'AI가 생성한 점수와 피드백은 교사의 최종 판단을 위한 참고자료입니다. 교사가 검토하고 조정하는 과정이 반드시 필요합니다.' },
              { title: '맥락은 교사만 압니다', desc: '학생의 학습 배경, 개인적 상황, 수업 분위기 등 AI가 알 수 없는 맥락을 교사가 반영해야 합니다.' },
              { title: '피드백은 대화의 시작점', desc: 'AI 피드백을 학생에게 그대로 전달하기보다, 교사가 보충·수정하여 개별 맞춤 피드백으로 전환하세요.' },
              { title: '비식별화가 자동 적용됩니다', desc: '학생 이름은 AI 호출 전에 자동으로 "학생"으로 치환됩니다. 개인정보가 외부 API로 전송되지 않습니다.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-blue-500 mt-0.5">•</span>
                <div>
                  <strong className="text-sm">{item.title}</strong>
                  <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold mb-3">API 비용 참고</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left p-2">항목</th>
                <th className="text-center p-2">토큰 수</th>
                <th className="text-center p-2">예상 비용</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t"><td className="p-2">개별 평가 1회</td><td className="p-2 text-center">~2,500</td><td className="p-2 text-center">~$0.01</td></tr>
              <tr className="border-t"><td className="p-2">성장 분석 1회</td><td className="p-2 text-center">~3,500</td><td className="p-2 text-center">~$0.015</td></tr>
              <tr className="border-t"><td className="p-2">포트폴리오 1회</td><td className="p-2 text-center">~4,000</td><td className="p-2 text-center">~$0.02</td></tr>
              <tr className="border-t"><td className="p-2">생기부 초안 1회</td><td className="p-2 text-center">~2,000</td><td className="p-2 text-center">~$0.01</td></tr>
              <tr className="border-t bg-slate-50 font-semibold"><td className="p-2">30명 학급 전체 (5실천)</td><td className="p-2 text-center">-</td><td className="p-2 text-center">~$10-15</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  },
  {
    id: 'examples',
    title: '수준별 예시',
    icon: '📖',
    content: () => (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-bold mb-2">AI 활용 일지 — 시간에 따른 성장 예시</h3>
          <p className="text-sm text-slate-500 mb-4">같은 학생의 AI 활용 일지가 한 학기 동안 어떻게 변화하는지 보여주는 예시입니다. 성장 분석 페이지에서 이런 변화를 자동으로 감지합니다.</p>

          <div className="grid grid-cols-3 gap-4">
            {[
              {
                period: '3월 (초반)',
                color: 'border-red-300 bg-red-50',
                level: '미달',
                items: [
                  { label: '프롬프트', value: '"LED 코드 써줘"' },
                  { label: '수정', value: '"안 바꿈"' },
                  { label: '문제점', value: '"없음"' },
                  { label: '결정', value: '"그대로 씀"' },
                ]
              },
              {
                period: '4월 (중반)',
                color: 'border-blue-300 bg-blue-50',
                level: '우수',
                items: [
                  { label: '프롬프트', value: '"DHT22 센서로 OLED에 표시"' },
                  { label: '수정', value: 'SH1106 라이브러리 변경' },
                  { label: '문제점', value: 'OLED 칩 호환성 문제' },
                  { label: '결정', value: '온도 경고 추가' },
                ]
              },
              {
                period: '5월 (후반)',
                color: 'border-emerald-300 bg-emerald-50',
                level: '탁월',
                items: [
                  { label: '프롬프트', value: '"MQTT, QoS 1, 10초 간격, 재시도 포함"' },
                  { label: '수정', value: '보안 분리 + 재시도 + 토픽 재설계' },
                  { label: '문제점', value: '보안위험 + 포트차단 + 라이브러리 한계' },
                  { label: '결정', value: '로컬 브로커 (네트워크 안정성)' },
                ]
              },
            ].map((col, i) => (
              <div key={i} className={`border-2 rounded-lg p-4 ${col.color}`}>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-sm">{col.period}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    col.level === '탁월' ? 'bg-emerald-200 text-emerald-800' :
                    col.level === '우수' ? 'bg-blue-200 text-blue-800' : 'bg-red-200 text-red-800'
                  }`}>{col.level}</span>
                </div>
                <div className="space-y-2">
                  {col.items.map((item, j) => (
                    <div key={j}>
                      <div className="text-xs font-medium text-slate-500">{item.label}</div>
                      <div className="text-xs text-slate-800">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-emerald-800 mb-2">성장 포인트</h4>
            <ul className="text-xs text-emerald-700 space-y-1">
              <li>• <strong>프롬프트</strong>: "코드 써줘" → 맥락·조건·형태 완전 명시</li>
              <li>• <strong>수정</strong>: "안 바꿈" → 보안·에러처리·구조 개선 다수</li>
              <li>• <strong>문제점</strong>: "없음" → 보안 위험, 네트워크 환경, 라이브러리 한계 등 구조적 분석</li>
              <li>• <strong>결정</strong>: "그대로" → 현실적 제약 고려한 단계적 계획 수립</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-bold mb-4">피드백 작성 원칙</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-emerald-700">좋은 피드백</h4>
              <div className="bg-emerald-50 rounded p-3 text-xs">
                <p className="font-medium mb-1">"12시 10분쯤"이라는 시간과 "15분 대기"라는 수치가 좋았어요.</p>
                <p className="text-slate-500">→ 구체적 사례를 인용하여 칭찬</p>
              </div>
              <div className="bg-emerald-50 rounded p-3 text-xs">
                <p className="font-medium mb-1">실제로 내일 점심시간에 스톱워치로 재보세요. "12:12에 줄 서서 12:27에 받았다 = 15분"처럼요.</p>
                <p className="text-slate-500">→ 실천 가능한 구체적 행동 제안</p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-red-700">피해야 할 피드백</h4>
              <div className="bg-red-50 rounded p-3 text-xs">
                <p className="font-medium mb-1">"더 구체적으로 쓰세요."</p>
                <p className="text-slate-500">→ 무엇을 어떻게 구체적으로 할지 모름</p>
              </div>
              <div className="bg-red-50 rounded p-3 text-xs">
                <p className="font-medium mb-1">"잘했습니다. 계속 노력하세요."</p>
                <p className="text-slate-500">→ 어디가 잘했는지 모름, 동기부여 안 됨</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'record',
    title: '생기부 작성',
    icon: '📄',
    content: () => (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-bold mb-4">생기부 교과 세특 작성 가이드</h3>
          <p className="text-sm text-slate-500 mb-4">포트폴리오 페이지에서 자동 생성되는 생기부 초안의 작성 원칙입니다.</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-emerald-800 mb-2">작성 규칙</h4>
              <ul className="text-xs text-emerald-700 space-y-1.5">
                <li>• 300~500자 분량</li>
                <li>• 3인칭 관찰자 시점: "~함", "~보임", "~나타남"</li>
                <li>• 구체적 활동 내용과 결과 포함</li>
                <li>• 성장 과정과 변화 서술</li>
                <li>• AI 활용 능력과 비판적 사고 강조</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-red-800 mb-2">금지사항</h4>
              <ul className="text-xs text-red-700 space-y-1.5">
                <li>• "뛰어남", "우수함" 등 직접적 평가 형용사 지양</li>
                <li>• 다른 학생과의 비교 금지</li>
                <li>• 순위, 석차 언급 금지</li>
                <li>• 사실과 다른 내용 기술 금지</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">생기부 초안 예시</h4>
            <div className="bg-white rounded p-4 text-sm leading-relaxed border">
              인공지능 활용 프로젝트에서 '교실 내 온습도 실시간 모니터링 시스템'을 주제로 선정함.
              문제 정의 단계에서 수업 시간 데이터를 수집하여 '4교시 이후 CO2 농도 1000ppm 초과'라는
              구체적 문제를 도출함. AI가 제안한 SSD1306 OLED 라이브러리가 실제 키트의 SH1106 칩과
              호환되지 않는 문제를 발견하고 독립적으로 해결함. 프로젝트 후반에는 MQTT 통신 구현 시
              AI 코드의 보안 취약점(Wi-Fi 비밀번호 하드코딩)을 지적하고 환경변수 분리를 적용하는 등
              비판적 AI 활용 능력이 눈에 띄게 성장함. 학교 네트워크 환경의 포트 제한을 고려하여
              공개 서버 대신 로컬 브로커를 선택하는 등 현실적 제약을 반영한 의사결정 능력을 보임.
            </div>
            <p className="text-xs text-slate-500 mt-2">373자 | 강조 역량: AI 비판적 활용, 문제 해결, 의사결정</p>
          </div>
        </div>
      </div>
    )
  }
];

export default function TeacherGuidePage() {
  const [activeSection, setActiveSection] = useState('philosophy');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">교사용 가이드</h1>
        <p className="text-sm text-slate-500 mt-1">교육 철학, 루브릭 해설, 시스템 사용법을 안내합니다.</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === s.id
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s.icon} {s.title}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      {sections.find(s => s.id === activeSection)?.content()}
    </div>
  );
}
