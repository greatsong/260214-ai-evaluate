const EvaluationEngine = require('../services/evaluationEngine');

// Use a dummy API key since we're only testing pure functions
const engine = new EvaluationEngine('dummy-key');

describe('EvaluationEngine', () => {
  describe('parseJSON', () => {
    test('parses JSON from code block', () => {
      const text = '```json\n{"score": 3}\n```';
      expect(engine.parseJSON(text)).toEqual({ score: 3 });
    });

    test('parses JSON from bare code block', () => {
      const text = '```\n{"score": 3}\n```';
      expect(engine.parseJSON(text)).toEqual({ score: 3 });
    });

    test('parses JSON from text with surrounding content', () => {
      const text = 'Here is the result:\n{"score": 3, "level": "우수"}\nDone.';
      expect(engine.parseJSON(text)).toEqual({ score: 3, level: '우수' });
    });

    test('parses nested JSON correctly', () => {
      const text = '{"item_scores": {"specificity": {"score": 3}}, "total_score": 3.0}';
      const parsed = engine.parseJSON(text);
      expect(parsed.item_scores.specificity.score).toBe(3);
    });

    test('returns null for invalid JSON', () => {
      expect(engine.parseJSON('no json here')).toBeNull();
    });

    test('returns null for empty string', () => {
      expect(engine.parseJSON('')).toBeNull();
    });
  });

  describe('deidentify', () => {
    test('replaces student name with 학생', () => {
      expect(engine.deidentify('김철수의 보고서입니다', '김철수')).toBe('학생의 보고서입니다');
    });

    test('replaces all occurrences', () => {
      expect(engine.deidentify('김철수가 김철수에게', '김철수')).toBe('학생가 학생에게');
    });

    test('returns original text when no name provided', () => {
      expect(engine.deidentify('some text', null)).toBe('some text');
      expect(engine.deidentify('some text', '')).toBe('some text');
    });

    test('returns original text when text is empty', () => {
      expect(engine.deidentify('', '김철수')).toBe('');
      expect(engine.deidentify(null, '김철수')).toBeNull();
    });

    test('handles special regex characters in name', () => {
      expect(engine.deidentify('test (학생) here', '(학생)')).toBe('test 학생 here');
    });
  });

  describe('precheckInput', () => {
    test('valid input passes', () => {
      const result = engine.precheckInput('이것은 충분히 긴 산출물 텍스트입니다', 'p1_discomfort');
      expect(result.valid).toBe(true);
    });

    test('empty text fails', () => {
      expect(engine.precheckInput('', 'p1_discomfort').valid).toBe(false);
      expect(engine.precheckInput(null, 'p1_discomfort').valid).toBe(false);
    });

    test('short text fails', () => {
      const result = engine.precheckInput('짧은텍스트', 'p1_discomfort');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('10자');
    });

    test('unknown practice type fails', () => {
      const result = engine.precheckInput('이것은 충분히 긴 산출물 텍스트입니다', 'invalid_type');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('알 수 없는');
    });

    test('all valid practice types pass', () => {
      const types = ['p1_discomfort', 'p2_comparison', 'p3_definition', 'p4_ai_log', 'p7_reflection'];
      types.forEach(type => {
        expect(engine.precheckInput('이것은 충분히 긴 산출물 텍스트입니다', type).valid).toBe(true);
      });
    });
  });

  describe('validateScores', () => {
    test('clamps scores to 1-4 range', () => {
      const result = engine.validateScores({
        item_scores: {
          specificity: { score: 5, evidence: 'test', feedback: 'test' },
          classification: { score: 0, evidence: 'test', feedback: 'test' },
          reasoning: { score: 3, evidence: 'test', feedback: 'test' },
        },
        praise: 'good', improvement: 'try more', action_guide: 'do this'
      }, 'p1_discomfort');

      expect(result.item_scores.specificity.score).toBe(4);
      expect(result.item_scores.classification.score).toBe(1);
      expect(result.item_scores.reasoning.score).toBe(3);
    });

    test('calculates total_score as average', () => {
      const result = engine.validateScores({
        item_scores: {
          specificity: { score: 4, evidence: '', feedback: '' },
          classification: { score: 2, evidence: '', feedback: '' },
          reasoning: { score: 3, evidence: '', feedback: '' },
        }
      }, 'p1_discomfort');

      expect(result.total_score).toBe(3);
      expect(result.sum_score).toBe(9);
      expect(result.max_score).toBe(12);
    });

    test('determines level correctly', () => {
      // p1_discomfort has maxScore 12, thresholds: 탁월 ≥ 10, 우수 ≥ 8, 보통 ≥ 5
      const excellent = engine.validateScores({
        item_scores: {
          specificity: { score: 4, evidence: '', feedback: '' },
          classification: { score: 3, evidence: '', feedback: '' },
          reasoning: { score: 4, evidence: '', feedback: '' },
        }
      }, 'p1_discomfort');
      expect(excellent.level).toBe('탁월');

      const good = engine.validateScores({
        item_scores: {
          specificity: { score: 3, evidence: '', feedback: '' },
          classification: { score: 3, evidence: '', feedback: '' },
          reasoning: { score: 3, evidence: '', feedback: '' },
        }
      }, 'p1_discomfort');
      expect(good.level).toBe('우수');

      const poor = engine.validateScores({
        item_scores: {
          specificity: { score: 1, evidence: '', feedback: '' },
          classification: { score: 1, evidence: '', feedback: '' },
          reasoning: { score: 1, evidence: '', feedback: '' },
        }
      }, 'p1_discomfort');
      expect(poor.level).toBe('미달');
    });

    test('fills missing items with score 1', () => {
      const result = engine.validateScores({
        item_scores: {
          specificity: { score: 4, evidence: 'test', feedback: 'test' },
          // classification and reasoning are missing
        }
      }, 'p1_discomfort');

      expect(result.item_scores.classification.score).toBe(1);
      expect(result.item_scores.reasoning.score).toBe(1);
      expect(result.sum_score).toBe(6);
    });

    test('returns original result for null/undefined input', () => {
      expect(engine.validateScores(null, 'p1_discomfort')).toBeNull();
      expect(engine.validateScores({ item_scores: null }, 'p1_discomfort')).toEqual({ item_scores: null });
    });

    test('returns original result for invalid practice type', () => {
      const input = { item_scores: {} };
      expect(engine.validateScores(input, 'invalid')).toBe(input);
    });
  });
});
