// Arcade shuttle flight: horizontal drag, gravity and floor contact.
// Coordinates: x/y normalized court, z normalized height above the floor.
export const FLIGHT = Object.freeze({ gravity: 1.65, drag: 0.22, netHeight: 0.40 });
export function advanceShuttle(ball, dt) {
  if (!Number.isFinite(dt) || dt < 0 || dt > 0.1) throw new RangeError('Invalid frame duration');
  const damping = Math.exp(-FLIGHT.drag * dt);
  const vx = ball.vx * damping;
  const vy = ball.vy * damping;
  const vz = (ball.vzVelocity ?? 0) - FLIGHT.gravity * dt;
  return { ...ball, x: ball.x + vx * dt, y: ball.y + vy * dt,
    z: ball.z + vz * dt, vx, vy, vzVelocity: vz };
}
export function launchShuttle(ball, vx, vy, lift) {
  return { ...ball, vx, vy, z: Math.max(0.32, ball.z), vzVelocity: lift };
}
export function predictLanding(ball, maxTime = 3, step = 1 / 60) {
  let simulated = { ...ball };
  let time = 0;
  while (time < maxTime && simulated.z > 0) {
    const dt = Math.min(step, maxTime - time, 0.1);
    if (dt <= 0) break;
    simulated = advanceShuttle(simulated, dt);
    time += dt;
  }
  return { x: simulated.x, y: simulated.y, time };
}
