import test from 'node:test';
import assert from 'node:assert/strict';
import { predictIntercept, chooseAiReturn, estimateLanding } from '../src/game/ai.mjs';
test('intercept anticipates horizontal shuttle motion',()=>{const p=predictIntercept({x:.4,y:.3,vx:.1,vy:-.2},.1);assert.equal(p.x,.5);assert.equal(p.time,1)});
test('intercept stays within court',()=>{const p=predictIntercept({x:.99,y:.3,vx:2,vy:-.2},.1);assert.equal(p.x,.96)});
test('AI aims away from human with harder difficulty',()=>{const easy=chooseAiReturn({x:.2,y:.8},'easy',.5);const hard=chooseAiReturn({x:.2,y:.8},'hard',.5);assert.ok(hard.x>easy.x)});
test('landing prediction follows current velocity',()=>{const p=estimateLanding({x:.5,y:.5,vx:.1,vy:.5});assert.equal(p.time,1);assert.equal(p.x,.6);assert.equal(p.y,1)});
