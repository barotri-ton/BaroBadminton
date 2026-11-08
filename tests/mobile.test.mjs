import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
const html = readFileSync('index.html', 'utf8');
test('Vietnamese mobile entry and touch controls', () => {
  assert.match(html, /lang="vi"/);
  for (const label of ['Bắt đầu chơi','ĐÁNH CẦU','Cài đặt','Cầu lông vũ','Cầu nhựa']) assert.ok(html.includes(label), label);
  assert.match(html, /pointerdown/);
  assert.match(html, /viewport-fit=cover/);
});
