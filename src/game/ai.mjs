// Arcade AI: predict a reachable intercept and place returns away from the human.
export function predictIntercept(ball, targetY, maxTime = 1.8) {
  if (!Number.isFinite(ball.vy) || Math.abs(ball.vy) < 1e-6) return { x: ball.x, y: targetY, time: 0 };
  const time = Math.max(0, Math.min(maxTime, (targetY - ball.y) / ball.vy));
  return { x: Math.max(0.04, Math.min(0.96, ball.x + ball.vx * time)), y: targetY, time };
}
export function chooseAiReturn(player, difficulty = 'normal', random = Math.random()) {
  const side = player.x < 0.5 ? 0.78 : 0.22;
  const difficultyAccuracy = { easy: 0.36, normal: 0.65, hard: 0.86 }[difficulty] ?? 0.65;
  const targetX = 0.5 + (side - 0.5) * difficultyAccuracy + (random - 0.5) * (1 - difficultyAccuracy) * 0.35;
  const targetY = player.y > 0.78 ? 0.59 : 0.87;
  return { x: Math.max(0.08, Math.min(0.92, targetX)), y: targetY };
}
export function estimateLanding(ball, maxTime = 2) {
  const speed = Math.max(Math.abs(ball.vy), 0.001);
  const boundary = ball.vy > 0 ? 1 : 0;
  const time = Math.max(0, Math.min(maxTime, Math.abs((boundary - ball.y) / speed)));
  return { x: ball.x + ball.vx * time, y: ball.y + ball.vy * time, time };
}
