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
