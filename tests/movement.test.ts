import { describe, expect, it } from 'vitest';
import { movePlayer } from '../src/game/movement';

describe('local two-player movement', () => {
  it('keeps player one in the near half', () => {
    const next = movePlayer({ x: 0, z: -1 }, 1, 10, 10, 10);
    expect(next.z).toBeLessThanOrEqual(-0.22);
    expect(next.x).toBeLessThanOrEqual(2.37);
  });
  it('keeps player two in the far half', () => {
    const next = movePlayer({ x: 0, z: 1 }, 2, -10, -10, 10);
    expect(next.z).toBeGreaterThanOrEqual(0.22);
  });
  it('normalizes diagonal speed', () => {
    const straight = movePlayer({ x: 0, z: -4 }, 1, 1, 0, 0.02);
    const diagonal = movePlayer({ x: 0, z: -4 }, 1, 1, 1, 0.02);
    expect(Math.hypot(diagonal.x, diagonal.z + 4)).toBeCloseTo(straight.x, 6);
  });
});
