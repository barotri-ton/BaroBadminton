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
// Closed-form landing estimate avoids allocating hundreds of shuttle states every frame.
// The real flight is semi-implicit Euler; this analytic estimate is for UI guidance only.
export function predictLanding(ball, maxTime = 3, step = 1 / 60) {
  if (!Number.isFinite(maxTime) || maxTime <= 0 || !Number.isFinite(step) || step <= 0) throw new RangeError('Invalid prediction interval');
  const vz = ball.vzVelocity ?? 0;
  const gravity = FLIGHT.gravity;
  const discriminant = vz * vz + 2 * gravity * Math.max(0, ball.z);
  // A grounded, descending shuttle must not predict a negative landing time.
  const time = Math.max(0, Math.min(maxTime, (vz + Math.sqrt(discriminant)) / gravity));
  const travel = FLIGHT.drag > 0 ? -Math.expm1(-FLIGHT.drag * time) / FLIGHT.drag : time;
  return { x: ball.x + ball.vx * travel, y: ball.y + ball.vy * travel, time };
}
