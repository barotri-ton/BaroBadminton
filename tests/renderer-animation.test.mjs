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
  assert.match(source,/actor\.group\.rotation\.z/);
  assert.match(source,/actor\.group\.rotation\.x/);
});
