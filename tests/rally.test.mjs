import test from 'node:test';
import assert from 'node:assert/strict';
import { netFaultWinner, sidelineFaultWinner, baselineFaultWinner, canHumanHit, canAiHit, crossedNetBelowTape } from '../src/game/rally.mjs';
test('human net fault awards AI',()=>assert.equal(netFaultWinner(-0.3),1));
test('AI net fault awards human',()=>assert.equal(netFaultWinner(0.3),0));
test('AI shuttle out at near baseline awards human',()=>assert.equal(baselineFaultWinner(1.1),0));
test('human shuttle out at far baseline awards AI',()=>assert.equal(baselineFaultWinner(-0.1),1));
test('sideline fault uses last hitter direction',()=>{assert.equal(sidelineFaultWinner(-0.5),1);assert.equal(sidelineFaultWinner(0.5),0)});
test('human only hits inbound shuttle within reach',()=>{const p={x:.5,y:.8};assert.equal(canHumanHit({x:.5,y:.8,z:.3,vy:.3},p),true);assert.equal(canHumanHit({x:.5,y:.8,z:.3,vy:-.3},p),false);assert.equal(canHumanHit({x:.1,y:.8,z:.3,vy:.3},p),false)});
test('AI only hits shuttle heading toward AI',()=>{const b={x:.5,y:.2};assert.equal(canAiHit({x:.5,y:.2,z:.3,vy:-.3},b,.17),true);assert.equal(canAiHit({x:.5,y:.2,z:.3,vy:.3},b,.17),false)});

test('grounded shuttle cannot be hit by either player',()=>{
  const human={x:.5,y:.8},bot={x:.5,y:.2};
  for(const z of [0,-.01]){
    assert.equal(canHumanHit({x:.5,y:.8,z,vy:.3},human),false);
    assert.equal(canAiHit({x:.5,y:.2,z,vy:-.3},bot,.17),false);
  }
});

test('net contact uses interpolated crossing height, not end-of-frame height',()=>{
  assert.equal(crossedNetBelowTape({y:.49,z:.42},{y:.53,z:.30},.4),true);
  assert.equal(crossedNetBelowTape({y:.49,z:.45},{y:.53,z:.35},.4),false);
  assert.equal(crossedNetBelowTape({y:.49,z:.2},{y:.495,z:.1},.4),false);
  assert.equal(crossedNetBelowTape({y:.51,z:.2},{y:.49,z:.2},.4),true);
});
