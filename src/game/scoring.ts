export type Side = 1 | 2;
export type ScoreState = { points: [number, number]; games: [number, number]; server: Side; winner: Side | null };
export const initialScore = (): ScoreState => ({ points: [0, 0], games: [0, 0], server: 1, winner: null });
export function awardRally(score: ScoreState, side: Side): ScoreState {
  if (score.winner !== null) return score;
  const points: [number, number] = [...score.points];
  const games: [number, number] = [...score.games];
  points[side - 1] += 1;
  const [a, b] = points;
  const gameFinished = (a >= 21 || b >= 21) && (Math.abs(a - b) >= 2 || a === 30 || b === 30);
  if (gameFinished) {
    games[side - 1] += 1;
    return { points: [0, 0], games, server: side, winner: games[side - 1] === 2 ? side : null };
  }
  return { points, games, server: side, winner: null };
}
