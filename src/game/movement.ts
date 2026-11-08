export type Position = { x: number; z: number };
export type PlayerSide = 1 | 2;
export const COURT_HALF_WIDTH = 2.59;
export const COURT_HALF_LENGTH = 6.7;
export const PLAYER_SPEED = 3.8;
const RADIUS = 0.22;

export function movePlayer(position: Position, side: PlayerSide, dx: number, dz: number, dt: number): Position {
  const length = Math.hypot(dx, dz);
  if (!length || dt <= 0) return position;
  const distance = PLAYER_SPEED * Math.min(dt, 0.05) / length;
  const x = Math.max(-COURT_HALF_WIDTH + RADIUS, Math.min(COURT_HALF_WIDTH - RADIUS, position.x + dx * distance));
  const minZ = side === 1 ? -COURT_HALF_LENGTH + RADIUS : RADIUS;
  const maxZ = side === 1 ? -RADIUS : COURT_HALF_LENGTH - RADIUS;
  const z = Math.max(minZ, Math.min(maxZ, position.z + dz * distance));
  return { x, z };
}
