import test from 'node:test';
import assert from 'node:assert/strict';
import {athletePose} from '../src/game/athlete-pose.mjs';
test('idle pose has no gait and remains finite',()=>{const p=athletePose();assert.equal(p.gait,0);assert.equal(p.jump,0);assert.ok(Number.isFinite(p.stride))});
test('running advances stride and limits body lean',()=>{const p=athletePose({dx:0.3,dz:-0.2,dt:0.016});assert.ok(p.stride>0);assert.ok(Math.abs(p.leanZ)<=0.16);assert.ok(Math.abs(p.leanX)<=0.12)});
test('smash has jump and more racket power than drop',()=>{const smash=athletePose({shot:'smash',swingProgress:0.5});const drop=athletePose({shot:'drop',swingProgress:0.5});assert.ok(smash.swing>drop.swing);assert.ok(smash.jump>0);assert.equal(drop.jump,0)});
test('completed swings return to neutral',()=>{assert.equal(athletePose({shot:'smash',swingProgress:1}).swing,0);assert.equal(athletePose({shot:'smash',swingProgress:1}).jump,0)});
