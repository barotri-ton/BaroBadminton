import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../src/game/renderer3d.mjs', import.meta.url), 'utf8');
test('racket rig keeps frame, strings and shaft attached',()=>{
  assert.match(source,/racketRig\.add\(racket\)/);
  assert.match(source,/racketRig\.add\(strings\)/);
  assert.match(source,/racketRig\.add\(shaft\)/);
});
test('both players receive racket swing animation',()=>{
  assert.match(source,/user\.racketRig\.rotation\.x/);
  assert.match(source,/opponent\.racketRig\.rotation\.x/);
});
test('athletes lean during movement and recover at rest',()=>{
  assert.match(source,/actor\.torsoRig\.rotation\.z/);
  assert.match(source,/actor\.torsoRig\.rotation\.x/);
});

test('smash and drop have different animation durations and power',()=>{
  assert.match(source,/currentShot === 'smash' \? 330/);
  assert.match(source,/currentShot === 'drop' \? 540/);
  assert.match(source,/attackPose\.swing/);
});
test('impact ring and shuttle trail are included',()=>{
  assert.match(source,/impactRing\.visible/);
  assert.match(source,/shuttleTrail\.push/);
});

test('AI swing is driven by explicit contact pulse, not shuttle direction',()=>{
  assert.match(source,/state\.aiSwingPulse !== lastAiSwingPulse/);
  assert.doesNotMatch(source,/lastOpponentDirection/);
});

test('racket strings share the same local center as the racket frame',()=>{
  assert.match(source,/strings\.position\.copy\(racket\.position\)/);
  assert.doesNotMatch(source,/strings\.position\.sub\(racketRig\.position\)/);
});
test('stylized athlete has footwork and idle breathing',()=>{
  assert.match(source,/actor\.feet\[0\]\.rotation\.x/);
  assert.match(source,/actor\.legs\[0\]\.rotation\.z/);
  assert.match(source,/Math\.sin\(now \* 0\.002\)/);
});

test('waist pivot rig separates upper body from footwork',()=>{
  assert.match(source,/torsoRig\.position\.y = 0\.75/);
  assert.match(source,/torsoRig\.add\(part\)/);
  assert.match(source,/part\.position\.y -= torsoRig\.position\.y/);
  assert.match(source,/torsoRig, legs, knees, feet, arms/);
});

test('legs have articulated knees and shoes attached below the knee',()=>{
  assert.match(source,/const knee = new THREE\.Group\(\)/);
  assert.match(source,/knee\.add\(shoe\)/);
  assert.match(source,/actor\.knees\[0\]\.rotation\.x/);
});
test('arms have animated elbow joints for player and opponent',()=>{
  assert.match(source,/const elbow = new THREE\.Group\(\)/);
  assert.match(source,/elbow\.add\(forearm\)/);
  assert.match(source,/user\.elbows\[1\]\.rotation\.x/);
  assert.match(source,/opponent\.elbows\[1\]\.rotation\.x/);
});

test('racket follows dominant forearm rather than floating at torso',()=>{
  assert.match(source,/elbows\[1\]\.add\(racketRig\)/);
  assert.match(source,/torsoRig\.remove\(racketRig\)/);
  assert.match(source,/racketRig\.position\.set\(0, 0\.33, 0\)/);
});
