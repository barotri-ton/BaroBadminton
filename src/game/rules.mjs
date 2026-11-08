// Badminton singles rally scoring: best of three games, 21 points, deuce and 30-point cap.
export function newMatch() {
  return { points: [0, 0], games: [0, 0], server: 0, winner: null, lastGameWinner: null };
}
export function awardRally(match, winner) {
  if (winner !== 0 && winner !== 1) throw new RangeError('Invalid side');
  if (match.winner !== null) return match;
  const points = [...match.points];
  const games = [...match.games];
  points[winner]++;
  const [a, b] = points;
  const gameOver = (Math.max(a, b) >= 21 && Math.abs(a - b) >= 2) || Math.max(a, b) === 30;
  if (!gameOver) return { ...match, points, games, server: winner, lastGameWinner: null };
  games[winner]++;
  return { points: [0, 0], games, server: winner, lastGameWinner: winner, winner: games[winner] >= 2 ? winner : null };
}
export function scoreLabel(match, localMultiplayer = false) {
  return `${localMultiplayer ? 'P1' : 'Bạn'} ${match.points[0]} — ${match.points[1]} ${localMultiplayer ? 'P2' : 'Máy'} · Hiệp ${match.games[0]}–${match.games[1]}`;
}
