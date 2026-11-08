export type Vec3 = { x: number; y: number; z: number };
export type ShuttleState = { position: Vec3; velocity: Vec3; active: boolean };
export const PHYSICS_DT = 1 / 120;
const GRAVITY = 9.81;
const DRAG = 0.085;
export function stepShuttle(state: ShuttleState, dt = PHYSICS_DT): ShuttleState {
  if (!state.active) return state;
  const speed = Math.hypot(state.velocity.x, state.velocity.y, state.velocity.z);
  const drag = DRAG * speed;
  const velocity = {
    x: state.velocity.x - drag * state.velocity.x * dt,
    y: state.velocity.y - (GRAVITY + drag * state.velocity.y) * dt,
    z: state.velocity.z - drag * state.velocity.z * dt
  };
  const position = {
    x: state.position.x + velocity.x * dt,
    y: state.position.y + velocity.y * dt,
    z: state.position.z + velocity.z * dt
  };
  if (position.y <= 0) return { position: { ...position, y: 0 }, velocity: { x: 0, y: 0, z: 0 }, active: false };
  return { position, velocity, active: true };
}
export function launchShuttle(from: Vec3, to: Vec3, duration = 1.25): ShuttleState {
  if (duration <= 0) throw new Error('Duration must be positive');
  return { position: { ...from }, velocity: {
    x: (to.x - from.x) / duration,
    y: (to.y - from.y + 0.5 * GRAVITY * duration * duration) / duration,
    z: (to.z - from.z) / duration
  }, active: true };
}
export function isInSinglesCourt(position: Vec3): boolean {
  return Math.abs(position.x) <= 2.59 && Math.abs(position.z) <= 6.7;
}
