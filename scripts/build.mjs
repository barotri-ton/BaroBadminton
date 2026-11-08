import { mkdir, copyFile } from 'node:fs/promises';
import { build } from 'esbuild';
await mkdir('dist/src/game', { recursive: true });
await copyFile('index.html', 'dist/index.html');
await copyFile('src/game/rules.mjs', 'dist/src/game/rules.mjs');
await build({ entryPoints: ['src/game/renderer3d.mjs'], outfile: 'dist/render3d.js', bundle: true, format: 'esm', minify: true, target: ['safari15', 'chrome100'], logLevel: 'warning' });
console.log('Built Vietnamese mobile alpha with bundled Three.js 3D renderer');
