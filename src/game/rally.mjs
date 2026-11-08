// The rally winner is the opposite side from the last player who sent a fault.
// Side 0 = human (near court), side 1 = AI (far court).
export function netFaultWinner(velocityY) {
  if (!Number.isFinite(velocityY) || velocityY === 0) throw new RangeError('Invalid shuttle direction');
  return velocityY > 0 ? 0 : 1;
}
export function sidelineFaultWinner(velocityY) {
  return netFaultWinner(velocityY);
}
export function baselineFaultWinner(positionY) {
  if (!Number.isFinite(positionY) || (positionY >= 0 && positionY <= 1)) throw new RangeError('Shuttle is in court');
  return positionY < 0 ? 1 : 0;
}
export function canHumanHit(ball, player, cooldown = 0) {
  return cooldown <= 0 && ball.z > 0 && ball.vy > 0 && ball.y > 0.48 && ball.y < 0.96 &&
    Math.abs(player.x - ball.x) < 0.23 && Math.abs(player.y - ball.y) < 0.24;
}
export function canAiHit(ball, bot, reach) {
  return ball.z > 0 && ball.vy < 0 && ball.y < 0.45 &&
    Math.abs(ball.x - bot.x) < reach && Math.abs(ball.y - bot.y) < reach;
}
