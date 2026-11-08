import React, { useEffect, useState } from 'react';
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
function App() {
  const [players, setPlayers] = useState<[Position, Position]>([{ x: 0, z: -4 }, { x: 0, z: 4 }]);
  useEffect(() => {
    const keys = new Set<string>();
    const onDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault();
      keys.add(key);
    };
    const onUp = (event: KeyboardEvent) => keys.delete(event.key.toLowerCase());
    const onBlur = () => keys.clear();
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      const axes = (positive: string, negative: string) => Number(keys.has(positive)) - Number(keys.has(negative));
      const dx1 = axes('d', 'a');
      const dz1 = axes('s', 'w');
      const dx2 = axes('arrowright', 'arrowleft');
      const dz2 = axes('arrowdown', 'arrowup');
      if (dx1 || dz1 || dx2 || dz2) setPlayers(([p1, p2]) => [movePlayer(p1, 1, dx1, dz1, dt), movePlayer(p2, 2, dx2, dz2, dt)]);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); window.removeEventListener('blur', onBlur); };
  }, []);
  return <main>
    <header><h1>BaroBadminton 3D</h1><p>{vi.menu.localMultiplayer} · {vi.gameplay.playerOne} / {vi.gameplay.playerTwo}</p></header>
    <section className="scene"><Canvas shadows camera={{position:[10,12,14],fov:48}}><ambientLight intensity={1.1}/><directionalLight position={[3,12,5]} intensity={2} castShadow/><Court/><Player position={players[0]} color="#f0b44c"/><Player position={players[1]} color="#56b9ed"/></Canvas></section>
    <footer><p>{vi.gameplay.playerOne}: W, A, S, D · {vi.gameplay.playerTwo}: ↑, ←, ↓, →</p><p>Đã hỗ trợ di chuyển hai người chơi. Chức năng đánh cầu chưa sẵn sàng.</p></footer>
  </main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
