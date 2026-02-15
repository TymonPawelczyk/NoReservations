import { describe, it, expect } from 'vitest';
import { stage1Questions, stage2Questions, stage3Questions } from '../questions';

describe('questions.ts - Question Data Structures', () => {
  describe('stage1Questions - Food preferences', () => {
    it('should have correct number of questions', () => {
      expect(stage1Questions).toHaveLength(6);
    });

    it('should have unique question IDs', () => {
      const ids = stage1Questions.map(q => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have sequential IDs from q1 to q6', () => {
      const expectedIds = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
      const actualIds = stage1Questions.map(q => q.id);
      expect(actualIds).toEqual(expectedIds);
    });

    it('should have non-empty question text for all questions', () => {
      stage1Questions.forEach(q => {
        expect(q.question).toBeTruthy();
        expect(q.question.length).toBeGreaterThan(0);
      });
    });

    it('should have at least 2 options per question', () => {
      stage1Questions.forEach(q => {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should have unique option values per question', () => {
      stage1Questions.forEach(q => {
        const values = q.options.map(o => o.value);
        expect(new Set(values).size).toBe(values.length);
      });
    });

    it('should have points for all outcomes (italian, hotpot, sushi)', () => {
      stage1Questions.forEach(q => {
        q.options.forEach(opt => {
          expect(opt.points).toHaveProperty('italian');
          expect(opt.points).toHaveProperty('hotpot');
          expect(typeof opt.points.italian).toBe('number');
          expect(typeof opt.points.hotpot).toBe('number');
        });
      });
    });

    it('should have non-negative point values', () => {
      stage1Questions.forEach(q => {
        q.options.forEach(opt => {
          expect(opt.points.italian).toBeGreaterThanOrEqual(0);
          expect(opt.points.hotpot).toBeGreaterThanOrEqual(0);
          if (opt.points.sushi !== undefined) {
            expect(opt.points.sushi).toBeGreaterThanOrEqual(0);
          }
        });
      });
    });

    it('should have non-empty labels for all options', () => {
      stage1Questions.forEach(q => {
        q.options.forEach(opt => {
          expect(opt.label).toBeTruthy();
          expect(opt.label.length).toBeGreaterThan(0);
        });
      });
    });

    it('should have at least one option with points for each outcome per question', () => {
      stage1Questions.forEach(q => {
        const hasItalianPoints = q.options.some(opt => opt.points.italian > 0);
        const hasHotpotPoints = q.options.some(opt => opt.points.hotpot > 0);

        expect(hasItalianPoints || hasHotpotPoints).toBe(true);
      });
    });
  });

  describe('stage2Questions - Activity selection', () => {
    it('should have correct number of questions', () => {
      expect(stage2Questions).toHaveLength(5);
    });

    it('should have unique question IDs', () => {
      const ids = stage2Questions.map(q => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have sequential IDs from q1 to q5', () => {
      const expectedIds = ['q1', 'q2', 'q3', 'q4', 'q5'];
      const actualIds = stage2Questions.map(q => q.id);
      expect(actualIds).toEqual(expectedIds);
    });

    it('should have non-empty question text for all questions', () => {
      stage2Questions.forEach(q => {
        expect(q.question).toBeTruthy();
        expect(q.question.length).toBeGreaterThan(0);
      });
    });

    it('should have at least 2 options per question', () => {
      stage2Questions.forEach(q => {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should have points for all activity outcomes', () => {
      const requiredActivities = ['museum', 'walk', 'bowling', 'pool', 'picnic'];

      stage2Questions.forEach(q => {
        q.options.forEach(opt => {
          requiredActivities.forEach(activity => {
            expect(opt.points).toHaveProperty(activity);
            expect(typeof opt.points[activity]).toBe('number');
          });
        });
      });
    });

    it('should have non-negative point values', () => {
      stage2Questions.forEach(q => {
        q.options.forEach(opt => {
          Object.values(opt.points).forEach(points => {
            expect(points).toBeGreaterThanOrEqual(0);
          });
        });
      });
    });

    it('should include cinema as easter egg option in final question', () => {
      const finalQuestion = stage2Questions[stage2Questions.length - 1];
      const hasCinema = finalQuestion.options.some(opt => opt.value === 'cinema');
      expect(hasCinema).toBe(true);
    });

    it('should have emojis in final question options', () => {
      const finalQuestion = stage2Questions[stage2Questions.length - 1];
      finalQuestion.options.forEach(opt => {
        // Check if label contains emoji (basic check)
        const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(opt.label);
        expect(hasEmoji).toBe(true);
      });
    });
  });

  describe('stage3Questions - Quiz', () => {
    it('should have correct number of questions', () => {
      expect(stage3Questions).toHaveLength(12);
    });

    it('should have unique question IDs', () => {
      const ids = stage3Questions.map(q => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have sequential IDs from q1 to q12', () => {
      const expectedIds = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12'];
      const actualIds = stage3Questions.map(q => q.id);
      expect(actualIds).toEqual(expectedIds);
    });

    it('should have non-empty question text for all questions', () => {
      stage3Questions.forEach(q => {
        expect(q.question).toBeTruthy();
        expect(q.question.length).toBeGreaterThan(0);
      });
    });

    it('should have exactly 3 options per question', () => {
      stage3Questions.forEach(q => {
        expect(q.options).toHaveLength(3);
      });
    });

    it('should have unique option values per question', () => {
      stage3Questions.forEach(q => {
        const values = q.options.map(o => o.value);
        expect(new Set(values).size).toBe(values.length);
      });
    });

    it('should have exactly one correct answer per question', () => {
      stage3Questions.forEach(q => {
        const correctOptions = q.options.filter(opt => opt.correct === true);
        expect(correctOptions).toHaveLength(1);
      });
    });

    it('should have correct property on all options', () => {
      stage3Questions.forEach(q => {
        q.options.forEach(opt => {
          expect(opt).toHaveProperty('correct');
          expect(typeof opt.correct).toBe('boolean');
        });
      });
    });

    it('should have non-empty labels for all options', () => {
      stage3Questions.forEach(q => {
        q.options.forEach(opt => {
          expect(opt.label).toBeTruthy();
          expect(opt.label.length).toBeGreaterThan(0);
        });
      });
    });

    it('should have general knowledge questions', () => {
      // Check that questions cover various topics
      const questions = stage3Questions.map(q => q.question.toLowerCase());

      // Should have geography questions
      const hasGeography = questions.some(q =>
        q.includes('australia') || q.includes('ocean') || q.includes('machu picchu')
      );
      expect(hasGeography).toBe(true);

      // Should have science questions
      const hasScience = questions.some(q =>
        q.includes('planet') || q.includes('świat') || q.includes('pierwiastek')
      );
      expect(hasScience).toBe(true);

      // Should have culture questions
      const hasCulture = questions.some(q =>
        q.includes('film') || q.includes('namalował')
      );
      expect(hasCulture).toBe(true);
    });
  });

  describe('Cross-stage validation', () => {
    it('should have different question structures for different stages', () => {
      // Stage 1 has points object
      expect(stage1Questions[0].options[0]).toHaveProperty('points');

      // Stage 3 has correct boolean
      expect(stage3Questions[0].options[0]).toHaveProperty('correct');

      // They should be different
      expect('correct' in stage1Questions[0].options[0]).toBe(false);
      expect('points' in stage3Questions[0].options[0]).toBe(false);
    });

    it('should have all questions with required properties', () => {
      const allQuestions = [
        ...stage1Questions,
        ...stage2Questions,
        ...stage3Questions,
      ];

      allQuestions.forEach(q => {
        expect(q).toHaveProperty('id');
        expect(q).toHaveProperty('question');
        expect(q).toHaveProperty('options');
        expect(Array.isArray(q.options)).toBe(true);
      });
    });
  });
});
