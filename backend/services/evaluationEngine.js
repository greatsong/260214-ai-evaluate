/**
 * Claude API 기반 평가 엔진 — 스펙 문서(tech_spec 3.2절) 기반 전면 재작성
 * - Anthropic 공식 SDK 사용
 * - Few-shot 예시 포함
 * - 점수 검증 + level 판정
 * - 재시도 로직 (3회, 지수 백오프)
 * - 비식별화 처리
 */

const Anthropic = require('@anthropic-ai/sdk');
const rubrics = require('../data/rubrics');

class EvaluationEngine {
  constructor(apiKey) {
    this.client = new Anthropic({ apiKey });
    this.model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';
    this.defaultTemperature = parseFloat(process.env.CLAUDE_TEMPERATURE || '0.3');
    this.retryTemperature = parseFloat(process.env.CLAUDE_RETRY_TEMPERATURE || '0.2');
    this.maxRetries = parseInt(process.env.CLAUDE_RETRY_COUNT || '3');
  }

  // ============================================================
  // 비식별화
  // ============================================================

  deidentify(text, studentName) {
    if (!studentName || !text) return text;
    const escaped = studentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(escaped, 'g'), '학생');
  }

  // ============================================================
  // 입력 사전 검증
  // ============================================================

  precheckInput(text, practiceType) {
    if (!text || typeof text !== 'string') {
      return { valid: false, reason: '산출물 텍스트가 비어있습니다.' };
    }
    const trimmed = text.trim();
    if (trimmed.length < 10) {
      return { valid: false, reason: '산출물이 너무 짧습니다 (최소 10자 이상 필요).' };
    }
    if (!rubrics[practiceType]) {
      return { valid: false, reason: `알 수 없는 실천 유형: ${practiceType}` };
    }
    return { valid: true };
  }

  // ============================================================
  // 시스템 프롬프트 빌더 (개별 평가)
  // ============================================================

  buildSystemPrompt(practiceType) {
    const rubric = rubrics[practiceType];
    if (!rubric) return '';

    const itemDescriptions = Object.entries(rubric.items).map(([key, item]) => {
      const levels = Object.entries(item.levels)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([level, desc]) => `  ${level}점: ${desc}`)
        .join('\n');
      return `### ${key} — ${item.name}\n설명: ${item.description}\n${levels}`;
    }).join('\n\n');

    const itemKeys = Object.keys(rubric.items);

    return `당신은 고등학교 AI·정보 교과 평가 전문가입니다. 학생의 실천 활동 산출물을 루브릭에 따라 엄격하게 평가합니다.

【역할과 원칙】
1. 루브릭의 각 수준 설명을 근거 기준으로 삼습니다.
2. 점수는 반드시 1, 2, 3, 4 중 하나의 정수입니다.
3. 각 항목마다 산출물에서 근거(evidence)를 직접 인용합니다.
4. 피드백은 격려적이되 구체적 개선 방향을 포함합니다.
5. 학생 이름은 절대 언급하지 않습니다 (비식별화).
6. 한국어로 작성합니다.

【평가 대상: ${rubric.name}】

${itemDescriptions}

【출력 형식 — 반드시 아래 JSON 구조를 따르세요】
\`\`\`json
{
  "item_scores": {
${itemKeys.map(k => `    "${k}": { "score": 점수, "evidence": "산출물에서 인용한 근거", "feedback": "해당 항목 피드백" }`).join(',\n')}
  },
  "total_score": 전체평균(소수점2자리),
  "level": "탁월/우수/보통/미달 중 하나",
  "praise": "잘한 점 (구체적 사례 인용)",
  "improvement": "개선이 필요한 점 (구체적 방향 제시)",
  "action_guide": "다음에 이렇게 해보세요 (실천 가능한 조언)"
}
\`\`\`

총점 기준:
- 탁월: ${rubric.levelThresholds.탁월}점 이상 / ${rubric.maxScore}점
- 우수: ${rubric.levelThresholds.우수}점 이상
- 보통: ${rubric.levelThresholds.보통}점 이상
- 미달: ${rubric.levelThresholds.보통}점 미만`;
  }

  // ============================================================
  // 점수 검증
  // ============================================================

  validateScores(result, practiceType) {
    const rubric = rubrics[practiceType];
    if (!rubric || !result || !result.item_scores) return result;

    const validatedScores = {};
    let totalRaw = 0;
    let count = 0;

    for (const [key, item] of Object.entries(rubric.items)) {
      const scoreData = result.item_scores[key];
      if (scoreData) {
        const score = Math.max(1, Math.min(4, Math.round(Number(scoreData.score) || 1)));
        validatedScores[key] = {
          score,
          evidence: scoreData.evidence || '',
          feedback: scoreData.feedback || ''
        };
        totalRaw += score;
        count++;
      } else {
        validatedScores[key] = { score: 1, evidence: '평가 데이터 없음', feedback: '' };
        totalRaw += 1;
        count++;
      }
    }

    const totalScore = count > 0 ? Math.round((totalRaw / count) * 100) / 100 : 0;
    const sumScore = totalRaw;

    let level = '미달';
    if (sumScore >= rubric.levelThresholds.탁월) level = '탁월';
    else if (sumScore >= rubric.levelThresholds.우수) level = '우수';
    else if (sumScore >= rubric.levelThresholds.보통) level = '보통';

    return {
      item_scores: validatedScores,
      total_score: totalScore,
      sum_score: sumScore,
      max_score: rubric.maxScore,
      level,
      praise: result.praise || '',
      improvement: result.improvement || '',
      action_guide: result.action_guide || ''
    };
  }

  // ============================================================
  // JSON 파싱
  // ============================================================

  parseJSON(text) {
    // 1차: ```json ... ``` 블록 추출
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try { return JSON.parse(codeBlockMatch[1].trim()); } catch (e) { /* fall through */ }
    }

    // 2차: 가장 바깥쪽 { } 매칭 (중첩 고려)
    let depth = 0;
    let start = -1;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (text[i] === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          try { return JSON.parse(text.substring(start, i + 1)); } catch (e) { /* fall through */ }
        }
      }
    }

    return null;
  }

  // ============================================================
  // API 호출 (재시도 포함)
  // ============================================================

  async callAPI(systemPrompt, userPrompt, maxTokens = 2000) {
    const retries = this.maxRetries;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.client.messages.create({
          model: this.model,
          max_tokens: maxTokens,
          temperature: this.defaultTemperature,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        });

        // 토큰 사용량 로깅
        if (response.usage) {
          console.log(`[평가엔진] 토큰: input=${response.usage.input_tokens}, output=${response.usage.output_tokens}`);
        }

        const responseText = response.content[0].text;
        const parsed = this.parseJSON(responseText);

        if (parsed) return parsed;

        // JSON 파싱 실패 시 재요청
        if (attempt < retries) {
          console.warn(`[평가엔진] JSON 파싱 실패, ${attempt}/${retries}회 재시도...`);
          const retryResponse = await this.client.messages.create({
            model: this.model,
            max_tokens: maxTokens,
            temperature: this.retryTemperature,
            system: systemPrompt,
            messages: [
              { role: 'user', content: userPrompt },
              { role: 'assistant', content: responseText },
              { role: 'user', content: '위 응답을 올바른 JSON 형식으로만 다시 출력해주세요. 설명 없이 JSON만 출력하세요.' }
            ]
          });
          const retryParsed = this.parseJSON(retryResponse.content[0].text);
          if (retryParsed) return retryParsed;
        }
      } catch (error) {
        console.error(`[평가엔진] API 오류 (${attempt}/${retries}):`, error.message);
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(r => setTimeout(r, delay));
        } else {
          throw error;
        }
      }
    }

    return { error: 'JSON 파싱 실패: 3회 시도 후에도 유효한 JSON을 받지 못했습니다.' };
  }

  // ============================================================
  // 개별 평가
  // ============================================================

  async evaluateArtifact(practiceType, artifactText, studentName = null) {
    const check = this.precheckInput(artifactText, practiceType);
    if (!check.valid) return { error: check.reason };

    const safeText = this.deidentify(artifactText, studentName);
    const systemPrompt = this.buildSystemPrompt(practiceType);

    const userPrompt = `다음 학생 산출물을 루브릭에 따라 평가해주세요.

【산출물】
${safeText}

각 항목마다 산출물에서 근거(evidence)를 직접 인용하고, 점수(1-4)와 피드백을 제공해주세요.
반드시 지정된 JSON 형식으로만 응답하세요.`;

    const result = await this.callAPI(systemPrompt, userPrompt, 2500);
    if (result.error) return result;

    return this.validateScores(result, practiceType);
  }

  // ============================================================
  // 성장 분석
  // ============================================================

  async generateGrowthAnalysis(practiceType, artifacts) {
    if (!artifacts || artifacts.length < 2) {
      return { error: '성장 분석을 위해 최소 2개 이상의 산출물이 필요합니다.' };
    }

    const rubric = rubrics[practiceType];
    if (!rubric) return { error: `알 수 없는 실천 유형: ${practiceType}` };

    const itemKeys = Object.keys(rubric.items);
    const itemNames = Object.entries(rubric.items).map(([k, v]) => `${k}: ${v.name}`).join(', ');

    const systemPrompt = `당신은 교육 평가 전문가입니다. 학생의 동일 실천 활동에 대한 여러 산출물을 시간순으로 비교하여 성장 과정을 분석합니다.

【분석 관점 — 4가지】
1. 구체성의 변화: 초기 → 후기에 걸쳐 서술이 얼마나 구체화되었는지
2. 비판적 사고의 성장: AI 결과에 대한 수용 → 검증 → 비판의 변화
3. 자기 결정력 발달: 단순 수용에서 근거 기반 판단으로의 변화
4. 기술적 이해의 깊이: 표면적 이해에서 구조적 이해로의 변화

【평가 항목】: ${itemNames}

【출력 형식 — 반드시 아래 JSON 구조를 따르세요】
\`\`\`json
{
  "individual_scores": [
    {
      "artifact_index": 1,
      "date": "날짜",
      "scores": {
${itemKeys.map(k => `        "${k}": 점수`).join(',\n')}
      }
    }
  ],
  "trajectory": {
${itemKeys.map(k => `    "${k}": { "start": 초기점수, "end": 최종점수, "change": 변화량, "trend": "상승/유지/하락" }`).join(',\n')}
  },
  "growth_narrative": "전체적인 성장 스토리 (구체적 변화 사례 인용)",
  "strongest_growth": "가장 크게 성장한 영역과 그 근거",
  "area_of_concern": "관심이 필요한 영역과 지원 방안",
  "next_steps": "다음 단계를 위한 구체적 제안"
}
\`\`\`

한국어로 작성하며, 산출물의 실제 내용을 인용하여 분석합니다.`;

    let artifactsText = '';
    artifacts.forEach((artifact, i) => {
      const date = artifact.date || `미표기`;
      const text = artifact.raw_text || '';
      artifactsText += `\n【산출물 ${i + 1} (${date})】\n${text}\n`;
    });

    const userPrompt = `다음은 한 학생의 "${rubric.name}" 산출물 ${artifacts.length}개입니다. 시간순으로 비교 분석해주세요.

${artifactsText}

각 산출물의 항목별 점수를 매기고, 시간에 따른 변화 추이를 분석해주세요.
반드시 지정된 JSON 형식으로만 응답하세요.`;

    const result = await this.callAPI(systemPrompt, userPrompt, 3500);
    return result;
  }

  // ============================================================
  // 포트폴리오 종합 평가 (FACT 프레임워크)
  // ============================================================

  async generatePortfolioFeedback(studentName, artifacts) {
    if (!artifacts || artifacts.length === 0) {
      return { error: '포트폴리오 평가를 위한 산출물이 없습니다.' };
    }

    const systemPrompt = `당신은 교육 평가 전문가입니다. 학생의 전체 포트폴리오를 FACT 프레임워크로 종합 평가합니다.

【FACT 프레임워크】
- F (Feasibility, 실현력): 아이디어를 실제로 구현하는 능력. 기술적 도전, 문제 해결 과정
- A (AI literacy, AI 리터러시): AI를 비판적으로 활용하는 능력. 프롬프트 설계, 결과 검증, 한계 인식
- C (Critical thinking, 비판적 사고): 정보를 분석·평가·종합하는 능력. 근거 기반 판단, 대안 비교
- T (Teamwork & Communication, 협업·소통): 아이디어를 공유하고 피드백을 수용하는 능력

【출력 형식 — 반드시 아래 JSON 구조를 따르세요】
\`\`\`json
{
  "fact_scores": {
    "F": { "score": 1-4점, "evidence": "근거", "feedback": "피드백" },
    "A": { "score": 1-4점, "evidence": "근거", "feedback": "피드백" },
    "C": { "score": 1-4점, "evidence": "근거", "feedback": "피드백" },
    "T": { "score": 1-4점, "evidence": "근거", "feedback": "피드백" }
  },
  "total_score": 전체평균(소수점2자리),
  "overall_narrative": "이 학생의 한 학기 성장 스토리 (300자 내외)",
  "top_strengths": ["강점1", "강점2"],
  "growth_areas": ["성장 필요 영역1", "성장 필요 영역2"],
  "teacher_recommendation": "교사에게 드리는 지도 제안"
}
\`\`\`

한국어로 작성하며, 실제 산출물 내용을 인용합니다.`;

    let artifactsSummary = '';
    artifacts.forEach((artifact, i) => {
      const type = rubrics[artifact.practice_type]?.name || artifact.practice_type;
      const date = artifact.date || '미표기';
      const text = this.deidentify(artifact.raw_text || '', studentName);
      artifactsSummary += `\n【산출물 ${i + 1}: ${type} (${date})】\n${text}\n`;
    });

    const userPrompt = `다음 학생의 전체 포트폴리오를 FACT 프레임워크로 종합 평가해주세요.

${artifactsSummary}

반드시 지정된 JSON 형식으로만 응답하세요.`;

    const result = await this.callAPI(systemPrompt, userPrompt, 4000);
    return result;
  }

  // ============================================================
  // 생기부 초안 생성
  // ============================================================

  async generateSchoolRecord(studentName, artifacts, portfolioResult = null) {
    if (!artifacts || artifacts.length === 0) {
      return { error: '생기부 초안 생성을 위한 산출물이 없습니다.' };
    }

    let portfolioContext = '';
    if (portfolioResult && portfolioResult.fact_scores) {
      portfolioContext = `\n【FACT 평가 결과 참고】\n${JSON.stringify(portfolioResult, null, 2)}\n`;
    }

    let artifactsSummary = '';
    artifacts.forEach((artifact, i) => {
      const type = rubrics[artifact.practice_type]?.name || artifact.practice_type;
      const text = this.deidentify(artifact.raw_text || '', studentName);
      artifactsSummary += `- ${type}: ${text.substring(0, 300)}\n`;
    });

    const systemPrompt = `당신은 한국 고등학교 학교생활기록부(생기부) 교과 세부능력 및 특기사항 작성 전문가입니다.

【작성 규칙 — 반드시 준수】
1. 300~500자 분량
2. 3인칭 관찰자 시점: "~함", "~보임", "~나타남" 문체
3. 구체적 활동 내용과 결과를 포함
4. 성장 과정과 변화를 서술
5. AI 활용 능력과 비판적 사고를 강조

【금지사항】
- "뛰어남", "우수함" 등 직접적 평가 형용사 지양
- 다른 학생과의 비교 금지
- 순위, 석차 언급 금지
- 추측성 표현 금지 ("~인 것 같음")

【예시 — 탁월 수준】
"인공지능 활용 프로젝트에서 '교실 내 온습도 실시간 모니터링 시스템'을 주제로 선정함. 문제 정의 단계에서 수업 시간 데이터를 수집하여 '4교시 이후 CO2 농도 1000ppm 초과'라는 구체적 문제를 도출함. AI에게 센서 코드를 요청할 때 핀 번호, 라이브러리, 출력 형태를 명시하는 프롬프트를 작성하였으며, AI가 제시한 SSD1306 라이브러리를 실제 보유한 SH1106 OLED에 맞게 수정하고 에러 처리 로직을 추가함. 프로젝트 진행 과정에서 AI 코드의 보안 취약점 3가지를 지적하고 대안을 제시하는 등 비판적 사고력의 성장이 관찰됨."

【출력 형식】
\`\`\`json
{
  "draft": "생기부 초안 텍스트 (300-500자)",
  "char_count": 글자수,
  "key_points": ["강조된 역량1", "강조된 역량2", "강조된 역량3"]
}
\`\`\``;

    const userPrompt = `다음 학생의 활동 기록을 바탕으로 생기부 교과 세부능력 및 특기사항 초안을 작성해주세요.

【학생 활동 산출물 요약】
${artifactsSummary}
${portfolioContext}

300-500자 분량으로, "~함/~보임" 문체로 작성해주세요.
반드시 지정된 JSON 형식으로만 응답하세요.`;

    const result = await this.callAPI(systemPrompt, userPrompt, 2000);
    return result;
  }
}

module.exports = EvaluationEngine;
