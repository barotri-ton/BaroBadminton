import test from 'node:test';
import assert from 'node:assert/strict';
import { newMatch, awardRally, scoreLabel } from '../src/game/rules.mjs';
function rallyMany(match, side, n) { for (let i = 0; i < n; i++) match = awardRally(match, side); return match; }
test('starts at zero with Vietnamese score', () => { const m = newMatch(); assert.equal(scoreLabel(m), 'Bạn 0 — 0 Máy · Hiệp 0–0'); });
test('wins a game at 21 with two point lead', () => { const m = rallyMany(newMatch(), 0, 21); assert.deepEqual(m.games, [1, 0]); assert.deepEqual(m.points, [0, 0]); assert.equal(m.winner, null); });
test('deuce requires two points', () => { let m = newMatch(); for (let i = 0; i < 20; i++) { m = awardRally(m, 0); m = awardRally(m, 1); } m = awardRally(m, 0); assert.deepEqual(m.games, [0, 0]); m = awardRally(m, 0); assert.deepEqual(m.games, [1, 0]); });
test('30th point wins even at 29 all', () => { let m = newMatch(); for (let i = 0; i < 29; i++) { m = awardRally(m, 0); m = awardRally(m, 1); } m = awardRally(m, 1); assert.deepEqual(m.games, [0, 1]); });
test('best of three and immutable final result', () => { let m = rallyMany(newMatch(), 0, 21); m = rallyMany(m, 0, 21); assert.equal(m.winner, 0); assert.deepEqual(awardRally(m, 1), m); });
test('winner serves next rally', () => { let m = awardRally(newMatch(), 1); assert.equal(m.server, 1); });
