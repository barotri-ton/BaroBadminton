import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceShuttle, launchShuttle, predictLanding } from '../src/game/flight.mjs';
test('gravity pulls shuttle down',()=>{const b=advanceShuttle({x:.5,y:.5,z:.8,vx:0,vy:.5,vzVelocity:0},.05);assert.ok(b.z<.8);assert.ok(b.vzVelocity<0)});
test('drag reduces horizontal shuttle speed',()=>{const b=advanceShuttle({x:.5,y:.5,z:.8,vx:.3,vy:.5,vzVelocity:0},.05);assert.ok(b.vx<.3);assert.ok(b.vy<.5)});
test('shot launch resets vertical velocity',()=>{const b=launchShuttle({x:.5,y:.5,z:.2,vzVelocity:-2},.1,-.5,.9);assert.equal(b.vzVelocity,.9);assert.equal(b.vy,-.5)});
test('landing prediction reaches floor in bounded time',()=>{const b=launchShuttle({x:.5,y:.5,z:.4},0,.25,.5);const p=predictLanding(b);assert.ok(p.time>0&&p.time<3);assert.ok(p.y>.5)});
test('invalid frame durations are rejected',()=>assert.throws(()=>advanceShuttle({x:.5,y:.5,z:.5,vx:0,vy:0},-.1),RangeError));

test('stationary shuttle landing time follows gravity',()=>{const p=predictLanding({x:.5,y:.5,z:.825,vx:0,vy:0,vzVelocity:0});assert.ok(Math.abs(p.time-1)<.001);assert.equal(p.x,.5)});
test('prediction preserves launch direction and drag',()=>{const p=predictLanding({x:.5,y:.5,z:.825,vx:.3,vy:-.4,vzVelocity:0});assert.ok(p.x>.5&&p.x<.8);assert.ok(p.y<.5&&p.y>.1)});
test('prediction rejects invalid intervals',()=>assert.throws(()=>predictLanding({x:0,y:0,z:1,vx:0,vy:0},0),RangeError));
