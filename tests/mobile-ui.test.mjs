import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('Vietnamese-first HTML and UTF-8 metadata', () => {
  assert.match(html, /<html lang="vi">/);
  assert.match(html, /<meta charset="utf-8">/);
  assert.match(html, /viewport-fit=cover/);
});

test('core Vietnamese game controls are present', () => {
  for (const text of ['Cài đặt', 'Bắt đầu chơi', 'ĐÁNH CẦU', 'Phông', 'Bỏ nhỏ', 'Đập', 'Cầu lông vũ', 'Cầu nhựa', 'Độ căng dây', 'Độ khó']) {
    assert.ok(html.includes(text), 'Missing Vietnamese game label: ' + text);
  }
});

test('mobile gameplay controls support pointer input and safe pause', () => {
  assert.match(html, /pointerdown/);
  assert.match(html, /pointercancel/);
  assert.match(html, /visibilitychange/);
  assert.match(html, /pointer=null/);
});

test('all three shot types and AI difficulties are wired to gameplay', () => {
  for (const shot of ['clear', 'drop', 'smash']) assert.ok(html.includes('data-shot="' + shot + '"'));
  for (const level of ['easy', 'normal', 'hard']) assert.ok(html.includes('value="' + level + '"'));
  assert.match(html, /const shots=\{/);
  assert.match(html, /const aiSpeed=\{/);
});

test('virtual joystick supports capture, movement and release',()=>{
  assert.match(html,/id="joystick"/);
  assert.match(html,/function moveStick\(event\)/);
  assert.match(html,/function releaseStick\(\)/);
  assert.match(html,/joystick\.setPointerCapture/);
  assert.match(html,/lostpointercapture/);
});
test('swiping hit button selects arcade shot types',()=>{
  assert.match(html,/hitButton\.addEventListener\('pointerup'/);
  assert.match(html,/Math\.hypot\(dx,dy\)>18/);
  assert.match(html,/dy< -16\?'smash'/);
  assert.match(html,/dy>16\?'clear':'drop'/);
});
