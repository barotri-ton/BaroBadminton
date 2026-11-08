import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
if (config.outputDirectory !== 'dist') throw new Error('Vercel outputDirectory must equal dist');
if (config.buildCommand !== 'npm run build') throw new Error('Vercel build command mismatch');
for (const path of ['index.html', 'src/game/rules.mjs', 'src/game/rally.mjs', 'src/game/ai.mjs', 'src/game/flight.mjs', 'render3d.js']) {
  const file = join(config.outputDirectory, path);
  if (!(await stat(file)).isFile()) throw new Error('Missing deployment artifact: ' + file);
}
const html = await readFile('dist/index.html', 'utf8');
if (!html.includes('lang="vi"')) throw new Error('Vietnamese locale missing');
if (!html.includes("./src/game/rules.mjs")) throw new Error('Game rules module not linked');
if (!html.includes("./src/game/rally.mjs")) throw new Error('Rally logic module not linked');
if (!html.includes("./src/game/ai.mjs")) throw new Error('AI module not linked');
if (!html.includes("./src/game/flight.mjs")) throw new Error('Flight physics module not linked');
if (!html.includes("./render3d.js")) throw new Error('3D renderer not linked');
console.log('Deployment output and Vietnamese locale validated');
