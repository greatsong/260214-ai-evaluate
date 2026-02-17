/**
 * 평가 엔진 핵심 로직 테스트 (프론트엔드)
 * 
 * ESM 모듈을 직접 import 하면 @anthropic-ai/sdk 의존성 문제가 있으므로,
 * 순수 함수 로직만 추출하여 테스트합니다.
 */

// parseJSON 로직 재현 (evaluationEngine.js의 parseJSON과 동일)
function parseJSON(text) {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try { return JSON.parse(codeBlockMatch[1].trim()); } catch (e) { /* fall through */ }
  }

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

// deidentify 로직 재현
function deidentify(text, studentName) {
  if (!studentName || !text) return text;
  const escaped = studentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(escaped, 'g'), '학생');
}

// precheckInput 로직 재현 (rubrics 의존성 없이 테스트 가능한 부분)
function precheckInput(text) {
  if (!text || typeof text !== 'string') {
    return { valid: false, reason: '산출물 텍스트가 비어있습니다.' };
  }
  if (text.trim().length < 10) {
    return { valid: false, reason: '산출물이 너무 짧습니다 (최소 10자 이상 필요).' };
  }
  return { valid: true };
}

// validateScores 핵심 로직 (점수 클램핑 + 평균 계산)
function clampScore(score) {
  return Math.max(1, Math.min(4, Math.round(Number(score) || 1)));
}

function calculateTotalScore(scores) {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, v) => acc + v.score, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

describe('parseJSON', () => {
  test('parses JSON from ```json code block', () => {
    const text = '```json\n{"score": 3}\n```';
    expect(parseJSON(text)).toEqual({ score: 3 });
  });

  test('parses JSON from bare ``` code block', () => {
    const text = '```\n{"score": 3}\n```';
    expect(parseJSON(text)).toEqual({ score: 3 });
  });

  test('parses JSON from text with surrounding content', () => {
    const text = 'Here is the result:\n{"score": 3, "level": "우수"}\nDone.';
    expect(parseJSON(text)).toEqual({ score: 3, level: '우수' });
  });

  test('parses deeply nested JSON', () => {
    const text = '{"item_scores": {"specificity": {"score": 3}}, "total_score": 3.0}';
    const parsed = parseJSON(text);
    expect(parsed.item_scores.specificity.score).toBe(3);
    expect(parsed.total_score).toBe(3.0);
  });

  test('returns null for text without JSON', () => {
    expect(parseJSON('no json here')).toBeNull();
  });

  test('returns null for empty string', () => {
    expect(parseJSON('')).toBeNull();
  });

  test('handles malformed JSON in code block gracefully', () => {
    const text = '```json\n{invalid json}\n```';
    expect(parseJSON(text)).toBeNull();
  });
});

describe('deidentify', () => {
  test('replaces student name with 학생', () => {
    expect(deidentify('김철수의 보고서입니다', '김철수')).toBe('학생의 보고서입니다');
  });

  test('replaces all occurrences', () => {
    expect(deidentify('김철수가 김철수에게', '김철수')).toBe('학생가 학생에게');
  });

  test('returns original text when no name provided', () => {
    expect(deidentify('some text', null)).toBe('some text');
    expect(deidentify('some text', '')).toBe('some text');
  });

  test('returns text as-is when text is empty or null', () => {
    expect(deidentify('', '김철수')).toBe('');
    expect(deidentify(null, '김철수')).toBeNull();
  });

  test('handles special regex characters in name', () => {
    expect(deidentify('test (학생) here', '(학생)')).toBe('test 학생 here');
  });
});

describe('precheckInput', () => {
  test('valid input passes', () => {
    expect(precheckInput('이것은 충분히 긴 산출물 텍스트입니다').valid).toBe(true);
  });

  test('empty text fails', () => {
    expect(precheckInput('').valid).toBe(false);
    expect(precheckInput(null).valid).toBe(false);
  });

  test('short text fails with message about 10자', () => {
    const result = precheckInput('짧은');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('10자');
  });

  test('exactly 10 characters passes', () => {
    expect(precheckInput('1234567890').valid).toBe(true);
  });

  test('non-string input fails', () => {
    expect(precheckInput(123).valid).toBe(false);
    expect(precheckInput(undefined).valid).toBe(false);
  });
});

describe('clampScore', () => {
  test('clamps score above 4 to 4', () => {
    expect(clampScore(5)).toBe(4);
    expect(clampScore(100)).toBe(4);
  });

  test('clamps score below 1 to 1', () => {
    expect(clampScore(0)).toBe(1);
    expect(clampScore(-1)).toBe(1);
  });

  test('rounds float scores', () => {
    expect(clampScore(2.6)).toBe(3);
    expect(clampScore(2.4)).toBe(2);
  });

  test('handles NaN/undefined as 1', () => {
    expect(clampScore(NaN)).toBe(1);
    expect(clampScore(undefined)).toBe(1);
    expect(clampScore('abc')).toBe(1);
  });

  test('keeps valid integers unchanged', () => {
    expect(clampScore(1)).toBe(1);
    expect(clampScore(2)).toBe(2);
    expect(clampScore(3)).toBe(3);
    expect(clampScore(4)).toBe(4);
  });
});

describe('calculateTotalScore', () => {
  test('calculates average correctly', () => {
    const scores = {
      a: { score: 4 },
      b: { score: 2 },
      c: { score: 3 },
    };
    expect(calculateTotalScore(scores)).toBe(3);
  });

  test('rounds to 2 decimal places', () => {
    const scores = {
      a: { score: 3 },
      b: { score: 3 },
      c: { score: 4 },
    };
    expect(calculateTotalScore(scores)).toBe(3.33);
  });

  test('returns 0 for empty scores', () => {
    expect(calculateTotalScore({})).toBe(0);
  });
});
