import test from 'node:test';
import assert from 'node:assert/strict';
import { predictIntercept, chooseAiReturn, estimateLanding } from '../src/game/ai.mjs';
test('intercept anticipates horizontal shuttle motion',()=>{const p=predictIntercept({x:.4,y:.3,vx:.1,vy:-.2},.1);assert.equal(p.x,.5);assert.ok(p.time>1&&p.time<1.2)});
test('intercept stays within court',()=>{const p=predictIntercept({x:.99,y:.3,vx:2,vy:-.2},.1);assert.equal(p.x,.96)});
test('AI aims away from human with harder difficulty',()=>{const easy=chooseAiReturn({x:.2,y:.8},'easy',.5);const hard=chooseAiReturn({x:.2,y:.8},'hard',.5);assert.ok(hard.x>easy.x)});
test('landing prediction follows current velocity',()=>{const p=estimateLanding({x:.5,y:.5,vx:.1,vy:.5});assert.equal(p.time,1);assert.equal(p.x,.6);assert.equal(p.y,1)});

test('interception respects drag and conserves predicted lateral displacement',()=>{
  const p=predictIntercept({x:.4,y:.3,vx:.1,vy:-.2},.1);
  assert.ok(Math.abs(p.x-.5)<1e-10);
  assert.ok(p.time>1);
});
test('interception does not travel backwards for unreachable target',()=>{
  const p=predictIntercept({x:.4,y:.3,vx:.1,vy:.2},.1);
  assert.equal(p.time,0);
  assert.equal(p.x,.4);
});
test('interception horizon limits drag-adjusted travel',()=>{
  const p=predictIntercept({x:.4,y:.3,vx:.1,vy:-.2},.1,.5);
  assert.equal(p.time,.5);
  assert.ok(p.x>.4&&p.x<.45);
});
