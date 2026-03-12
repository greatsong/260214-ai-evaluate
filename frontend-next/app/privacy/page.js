'use client';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-8">개인정보 처리방침</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6 text-sm leading-relaxed text-slate-700">

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">1. 개인정보 수집 목적</h2>
          <p>본 시스템은 다음 목적으로 개인정보를 수집합니다.</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>학생 산출물에 대한 AI 기반 평가 수행</li>
            <li>학생별 성장 분석 및 피드백 제공</li>
            <li>학교생활기록부(생기부) 초안 생성 지원</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">2. 수집 항목</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>이름, 학번, 반, 번호</li>
            <li>산출물 텍스트 (학생이 작성한 프로젝트 결과물)</li>
            <li>평가 결과 (점수, 피드백, 성장 분석 등)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">3. 보유 및 이용 기간</h2>
          <p>
            수집된 개인정보는 <strong>해당 학년도 종료 후 지체 없이 파기</strong>합니다.
            다만, 학생 또는 학부모의 요청이 있을 경우 즉시 삭제할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">4. AI API 이용 안내</h2>
          <p>
            본 시스템은 Anthropic Claude API를 활용하여 학생 산출물을 평가합니다.
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>
              AI API로 전송되는 데이터: <strong>산출물 텍스트만</strong> 전송됩니다.
              학생의 이름, 학번 등 개인 식별 정보는 API로 전송되지 않습니다.
            </li>
            <li>
              전송 목적: 루브릭 기반 평가, 성장 분석, 피드백 생성 등 서비스 운영을 위한 기술적 처리
            </li>
            <li>
              Anthropic의 API 이용약관에 따라 전송된 데이터는 모델 학습에 사용되지 않습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">5. 개인정보 보호 책임자</h2>
          <div className="bg-slate-50 rounded-lg p-4">
            <p><strong>석리송</strong></p>
            <p>당곡고등학교 정보과 교사</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">6. 열람 및 삭제 요청</h2>
          <p>
            학생 또는 학부모는 수집된 개인정보의 열람, 수정, 삭제를 요청할 수 있습니다.
            요청은 담당 교사에게 직접 연락하여 주시기 바랍니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">7. 개인정보의 안전성 확보 조치</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>교사 비밀번호 인증을 통한 접근 제한</li>
            <li>학생 개인 식별 정보를 AI API에 전송하지 않음</li>
            <li>해당 학년도 종료 후 데이터 파기</li>
          </ul>
        </section>

        <div className="pt-4 border-t text-xs text-slate-400">
          최종 수정일: 2026년 3월 12일
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
          메인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
