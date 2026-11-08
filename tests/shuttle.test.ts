import { describe, expect, it } from 'vitest';
import { isInSinglesCourt, launchShuttle, PHYSICS_DT, stepShuttle } from '../src/game/shuttle';

describe('shuttle simulation', () => {
  it('is deterministic with fixed timestep', () => {
    const simulate = () => {
      let state = launchShuttle({ x: 0, y: 1.3, z: -4 }, { x: 1, y: 0, z: 4 });
      for (let i = 0; i < 120; i++) state = stepShuttle(state, PHYSICS_DT);
      return state;
    };
    expect(simulate()).toEqual(simulate());
  });
  it('never passes through the floor', () => {
    let state = launchShuttle({ x: 0, y: 1, z: -2 }, { x: 0, y: 0, z: 2 });
    for (let i = 0; i < 600; i++) state = stepShuttle(state);
    expect(state.position.y).toBe(0);
    expect(state.active).toBe(false);
  });
  it('uses singles sidelines', () => {
    expect(isInSinglesCourt({ x: 2.5, y: 0, z: 6 })).toBe(true);
    expect(isInSinglesCourt({ x: 3, y: 0, z: 6 })).toBe(false);
  });
});
