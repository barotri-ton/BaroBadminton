import { describe, expect, it } from 'vitest';
import { awardRally, initialScore } from '../src/game/scoring';

describe('rally scoring', () => {
  it('requires two-point lead at 20-all', () => {
    let score = initialScore();
    for (let i = 0; i < 20; i++) { score = awardRally(score, 1); score = awardRally(score, 2); }
    score = awardRally(score, 1);
    expect(score.games).toEqual([0, 0]);
    score = awardRally(score, 1);
    expect(score.games).toEqual([1, 0]);
  });
  it('caps a game at 30', () => {
    let score = initialScore();
    for (let i = 0; i < 29; i++) { score = awardRally(score, 1); score = awardRally(score, 2); }
    score = awardRally(score, 2);
    expect(score.games).toEqual([0, 1]);
  });
  it('ends match after two games', () => {
    let score = initialScore();
    for (let i = 0; i < 42; i++) score = awardRally(score, 1);
    expect(score.winner).toBe(1);
  });
});
