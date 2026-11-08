import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('dist/src/game', { recursive: true });
await copyFile('index.html', 'dist/index.html');
await copyFile('src/game/rules.mjs', 'dist/src/game/rules.mjs');
console.log('Built Vietnamese mobile alpha and game rules into dist');
