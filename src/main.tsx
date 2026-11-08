import React, { useEffect, useRef, useState } from 'react';
import { awardRally, initialScore, type ScoreState } from './game/scoring';
import { launchShuttle, stepShuttle, isInSinglesCourt, PHYSICS_DT, type ShuttleState } from './game/shuttle';
import { movePlayer, type Position } from './game/movement';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import vi from './localization/vi-VN.json';
import './style.css';

const COURT_LENGTH = 13.4;
const COURT_WIDTH = 5.18;
function Court() {
  const lines: Array<[number, number, number, number]> = [
    [-COURT_WIDTH/2, -COURT_LENGTH/2, -COURT_WIDTH/2, COURT_LENGTH/2],
    [COURT_WIDTH/2, -COURT_LENGTH/2, COURT_WIDTH/2, COURT_LENGTH/2],
    [-COURT_WIDTH/2, -COURT_LENGTH/2, COURT_WIDTH/2, -COURT_LENGTH/2],
    [-COURT_WIDTH/2, COURT_LENGTH/2, COURT_WIDTH/2, COURT_LENGTH/2],
    [-COURT_WIDTH/2, -1.98, COURT_WIDTH/2, -1.98],
    [-COURT_WIDTH/2, 1.98, COURT_WIDTH/2, 1.98],
    [0, -COURT_LENGTH/2, 0, -1.98], [0, 1.98, 0, COURT_LENGTH/2],
    [-COURT_WIDTH/2, -COURT_LENGTH/2 + .76, COURT_WIDTH/2, -COURT_LENGTH/2 + .76],
    [-COURT_WIDTH/2, COURT_LENGTH/2 - .76, COURT_WIDTH/2, COURT_LENGTH/2 - .76]
  ];
  return <group>
    <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[18,22]}/><meshStandardMaterial color="#19342c"/></mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,.008,0]} receiveShadow><planeGeometry args={[COURT_WIDTH,COURT_LENGTH]}/><meshStandardMaterial color="#267c5a"/></mesh>
    {lines.map(([x1,z1,x2,z2],i) => <mesh key={i} position={[(x1+x2)/2,.025,(z1+z2)/2]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[Math.abs(x2-x1)||.04,Math.abs(z2-z1)||.04]}/><meshBasicMaterial color="white"/></mesh>)}
    <mesh position={[0,.775,0]}><boxGeometry args={[COURT_WIDTH+.15,1.55,.025]}/><meshStandardMaterial color="#dfe8e6" transparent opacity={.26} wireframe/></mesh>
    <mesh position={[-COURT_WIDTH/2-.08,.775,0]}><cylinderGeometry args={[.035,.035,1.55]}/><meshStandardMaterial color="white"/></mesh>
    <mesh position={[COURT_WIDTH/2+.08,.775,0]}><cylinderGeometry args={[.035,.035,1.55]}/><meshStandardMaterial color="white"/></mesh>
  </group>;
}
function Player({position,color}:{position:Position;color:string}) {return <mesh position={[position.x,.55,position.z]} castShadow><capsuleGeometry args={[.22,.65,8,16]}/><meshStandardMaterial color={color}/></mesh>}
function Shuttle({ state }: { state: ShuttleState }) {
  return <mesh position={[state.position.x, Math.max(0.07, state.position.y), state.position.z]} castShadow>
    <coneGeometry args={[0.085, 0.18, 12]}/><meshStandardMaterial color="#f6f4dc"/>
  </mesh>;
}
function App() {
  const [mobileMode, setMobileMode] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches);
  const touchAxis = useRef({ x: 0, z: 0 });
  const joystickPointer = useRef<number | null>(null);
  const joystickOrigin = useRef({ x: 0, y: 0 });
  const [stick, setStick] = useState({ x: 0, y: 0 });
  const updateStick = (clientX: number, clientY: number) => {
    const x = clientX - joystickOrigin.current.x;
    const y = clientY - joystickOrigin.current.y;
    const length = Math.hypot(x, y);
    const scale = length > 48 ? 48 / length : 1;
    const next = { x: x * scale, y: y * scale };
    setStick(next);
    touchAxis.current = { x: next.x / 48, z: next.y / 48 };
  };
  const releaseStick = () => { joystickPointer.current = null; touchAxis.current = { x: 0, z: 0 }; setStick({ x: 0, y: 0 }); };
  const [players, setPlayers] = useState<[Position, Position]>([{ x: 0, z: -4 }, { x: 0, z: 4 }]);
  const [shuttle, setShuttle] = useState<ShuttleState>({ position: { x: 0, y: 1, z: -4 }, velocity: { x: 0, y: 0, z: 0 }, active: false });
  const [score, setScore] = useState<ScoreState>(initialScore);
  const [message, setMessage] = useState<string>(vi.gameplay.serveTurn);
  const playersRef = useRef(players);
  const shuttleRef = useRef(shuttle);
  const scoreRef = useRef(score);
  const lastHitter = useRef<1 | 2 | null>(null);
  const paused = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const syncPlayers = (next: [Position, Position]) => { playersRef.current = next; setPlayers(next); };
  const syncShuttle = (next: ShuttleState) => { shuttleRef.current = next; setShuttle(next); };
  const syncScore = (next: ScoreState) => { scoreRef.current = next; setScore(next); };
  const serveOrHit = (side: 1 | 2) => {
    if (paused.current || scoreRef.current.winner !== null) return;
    const current = shuttleRef.current;
    const player = playersRef.current[side - 1];
    if (!current.active) {
      if (scoreRef.current.server !== side) return;
      syncShuttle(launchShuttle({ x: player.x, y: 1.05, z: player.z }, { x: 0, y: 0.3, z: side === 1 ? 4 : -4 }, 1.15));
      lastHitter.current = side;
      setMessage(vi.gameplay.serveTurn);
      return;
    }
    const distance = Math.hypot(player.x - current.position.x, player.z - current.position.z);
    if (distance > 1.3 || current.position.y > 2.6 || lastHitter.current === side) return;
    syncShuttle(launchShuttle({ ...current.position }, { x: -player.x * 0.4, y: 0.25, z: side === 1 ? 4.5 : -4.5 }, 1.1));
    lastHitter.current = side;
    setMessage(vi.gameplay.in);
  };
  const reset = () => {
    syncScore(initialScore());
    syncPlayers([{ x: 0, z: -4 }, { x: 0, z: 4 }]);
    syncShuttle({ position: { x: 0, y: 1, z: -4 }, velocity: { x: 0, y: 0, z: 0 }, active: false });
    lastHitter.current = null;
    paused.current = false;
    setIsPaused(false);
    setMessage(vi.gameplay.serveTurn);
  };
  useEffect(() => {
    const keys = new Set<string>();
    const onDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'enter'].includes(key)) event.preventDefault();
      if (event.repeat) return;
      keys.add(key);
      if (key === 'f') serveOrHitRef.current(1);
      if (key === 'enter') serveOrHitRef.current(2);
    };
    const onUp = (event: KeyboardEvent) => keys.delete(event.key.toLowerCase());
    const onBlur = () => keys.clear();
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);
    let frame = 0;
    let previous = performance.now();
    let accumulator = 0;
    const tick = (now: number) => {
      accumulator += Math.min((now - previous) / 1000, 0.05);
      previous = now;
      if (!paused.current && scoreRef.current.winner === null) {
        const axes = (positive: string, negative: string) => Number(keys.has(positive)) - Number(keys.has(negative));
        const touch = touchAxis.current;
        let nextPlayers = playersRef.current;
        let nextShuttle = shuttleRef.current;
        if (mobileModeRef.current && !nextShuttle.active && scoreRef.current.server === 2 && lastHitter.current !== 2) {
          nextShuttle = launchShuttle({ x: nextPlayers[1].x, y: 1.05, z: nextPlayers[1].z }, { x: nextPlayers[0].x, y: 0.3, z: -4 }, 1.15);
          lastHitter.current = 2;
        }
        let rallyEnded = false;
        while (accumulator >= PHYSICS_DT) {
          nextPlayers = [movePlayer(nextPlayers[0], 1, axes('d', 'a') + touch.x, axes('s', 'w') + touch.z, PHYSICS_DT), movePlayer(nextPlayers[1], 2, mobileModeRef.current ? Math.sign(nextShuttle.position.x - nextPlayers[1].x) * (nextShuttle.active && nextShuttle.position.z > 0 ? 1 : 0) : axes('arrowright', 'arrowleft'), mobileModeRef.current ? Math.sign((nextShuttle.active && nextShuttle.position.z > 0 ? nextShuttle.position.z : 4) - nextPlayers[1].z) : axes('arrowdown', 'arrowup'), PHYSICS_DT)];
          if (mobileModeRef.current && nextShuttle.active && lastHitter.current === 1 && nextShuttle.position.z > 0 && Math.hypot(nextPlayers[1].x - nextShuttle.position.x, nextPlayers[1].z - nextShuttle.position.z) < 1.1 && nextShuttle.position.y < 2.3) {
            nextShuttle = launchShuttle(nextShuttle.position, { x: nextPlayers[0].x, y: 0.25, z: -4.5 }, 1.15);
            lastHitter.current = 2;
          }
          if (nextShuttle.active) {
            const prior = nextShuttle;
            nextShuttle = stepShuttle(nextShuttle);
            if (prior.position.z * nextShuttle.position.z <= 0 && nextShuttle.position.y < 1.55) {
              nextShuttle = { ...nextShuttle, active: false };
              const winner = lastHitter.current === 1 ? 2 : 1;
              syncScore(awardRally(scoreRef.current, winner));
              lastHitter.current = null;
              setMessage(vi.gameplay.net);
              rallyEnded = true;
            } else if (!nextShuttle.active) {
              const inCourt = isInSinglesCourt(nextShuttle.position);
              const landedOnOpponentHalf = lastHitter.current === 1 ? nextShuttle.position.z > 0 : nextShuttle.position.z < 0;
              const winner = inCourt && landedOnOpponentHalf ? lastHitter.current! : (lastHitter.current === 1 ? 2 : 1);
              syncScore(awardRally(scoreRef.current, winner));
              lastHitter.current = null;
              setMessage(inCourt ? vi.gameplay.in : vi.gameplay.out);
              rallyEnded = true;
            }
          }
          accumulator -= PHYSICS_DT;
          if (rallyEnded) break;
        }
        if (nextPlayers[0].x !== playersRef.current[0].x || nextPlayers[0].z !== playersRef.current[0].z || nextPlayers[1].x !== playersRef.current[1].x || nextPlayers[1].z !== playersRef.current[1].z) syncPlayers(nextPlayers);
        if (nextShuttle !== shuttleRef.current) syncShuttle(nextShuttle);
      } else accumulator = 0;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); window.removeEventListener('blur', onBlur); };
  }, []);
  const mobileModeRef = useRef(mobileMode);
  mobileModeRef.current = mobileMode;
  const serveOrHitRef = useRef(serveOrHit);
  serveOrHitRef.current = serveOrHit;
  return <main>
    <header><h1>BaroBadminton 3D</h1><p>{mobileMode ? "Chơi trên điện thoại · Đấu với máy" : vi.menu.localMultiplayer}</p><label className="mode-toggle"><input type="checkbox" checked={mobileMode} onChange={event => { setMobileMode(event.target.checked); reset(); }}/>{ " " }Chế độ cảm ứng (đấu với máy)</label></header>
    <div className="scoreboard"><span>{vi.gameplay.playerOne}: {score.points[0]} ({score.games[0]})</span><strong>{score.winner ? vi.gameplay.matchOver : message}</strong><span>{vi.gameplay.playerTwo}: {score.points[1]} ({score.games[1]})</span></div>
    <section className="scene"><Canvas shadows camera={{position:[10,12,14],fov:48}}><ambientLight intensity={1.1}/><directionalLight position={[3,12,5]} intensity={2} castShadow/><Court/><Player position={players[0]} color="#f0b44c"/><Player position={players[1]} color="#56b9ed"/><Shuttle state={shuttle}/></Canvas></section>
    {mobileMode && <section className="touch-controls" aria-label="Điều khiển cảm ứng"><div className="joystick" role="group" aria-label="Di chuyển người chơi" onPointerDown={event => { event.preventDefault(); joystickPointer.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); const rect = event.currentTarget.getBoundingClientRect(); joystickOrigin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; updateStick(event.clientX, event.clientY); }} onPointerMove={event => { if (joystickPointer.current === event.pointerId) updateStick(event.clientX, event.clientY); }} onPointerUp={releaseStick} onPointerCancel={releaseStick}><div className="joystick-knob" style={{ transform: `translate(${stick.x}px, ${stick.y}px)` }}/></div><button className="hit-button" onPointerDown={event => { event.preventDefault(); serveOrHit(1); }}>Giao cầu / Đánh cầu</button></section>}
    <footer>
      {!mobileMode && <p>{vi.gameplay.playerOne}: W, A, S, D · Đánh cầu: F | {vi.gameplay.playerTwo}: ↑, ←, ↓, → · Đánh cầu: Enter</p>}
      <div className="actions"><button onClick={() => serveOrHit(1)}>{vi.gameplay.playerOne}: {vi.gameplay.serveTurn}</button>{!mobileMode && <button onClick={() => serveOrHit(2)}>{vi.gameplay.playerTwo}: {vi.gameplay.serveTurn}</button>}<button onClick={() => { paused.current = !paused.current; setIsPaused(paused.current); }}>{isPaused ? vi.gameplay.resume : vi.gameplay.pause}</button><button onClick={reset}>{vi.gameplay.rematch}</button></div>
      {score.winner && <p>{vi.gameplay.win}: {score.winner === 1 ? vi.gameplay.playerOne : vi.gameplay.playerTwo}</p>}
      <p>Phiên bản thử nghiệm: cơ chế đánh cầu và luật giao cầu đang được hoàn thiện.</p>
    </footer>
  </main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
