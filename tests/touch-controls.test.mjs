import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
test('touch pointer capture loss clears court target',()=>{assert.match(html,/\['pointerup','pointercancel','lostpointercapture'\]\.forEach\(ev=>canvas/);});
test('court pointer movement only follows captured pointer',()=>{assert.match(html,/if\(pointer&&canvas\.hasPointerCapture\(e\.pointerId\)\)/);});
test('backgrounding releases virtual joystick',()=>{assert.match(html,/document\.hidden&&playing\)\{paused=true;keys\.clear\(\);pointer=null;releaseStick\(\)/);});
test('focus loss pauses gameplay and exposes resume overlay',()=>{assert.match(html,/window\.addEventListener\('blur',[\s\S]*?paused=true;overlay\.style\.display='grid'/);});
