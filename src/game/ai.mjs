import { FLIGHT } from './flight.mjs';
// Arcade AI: predict a reachable intercept and place returns away from the human.
export function predictIntercept(ball, targetY, maxTime = 1.8) {
  if (!Number.isFinite(ball.vy) || Math.abs(ball.vy) < 1e-6) return { x: ball.x, y: targetY, time: 0 };
  // Match the exponential horizontal drag used by the shuttle flight model.
  // If the target lies behind the shuttle or beyond its drag-limited reach,
  // predict only as far as the configured horizon.
  const drag = FLIGHT.drag;
  const distance = (targetY - ball.y) / ball.vy;
  const ratio = drag * distance;
  const time = distance <= 0 ? 0 : ratio >= 1 ? maxTime : Math.min(maxTime, -Math.log1p(-ratio) / drag);
  // Never chase a projected interception after the shuttle has already landed.
  // Older callers without height information retain their original behavior.
  const height = ball.z;
  const verticalSpeed = ball.vzVelocity ?? 0;
  let reachableTime = time;
  if (Number.isFinite(height) && height >= 0 && Number.isFinite(verticalSpeed)) {
    const groundTime = Math.max(0, (verticalSpeed + Math.sqrt(verticalSpeed * verticalSpeed + 2 * FLIGHT.gravity * height)) / FLIGHT.gravity);
    reachableTime = Math.min(time, groundTime);
  }
  const travel = -Math.expm1(-drag * reachableTime) / drag;
  return { x: Math.max(0.04, Math.min(0.96, ball.x + ball.vx * travel)), y: targetY, time: reachableTime };
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
