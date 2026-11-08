import React from 'react';
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
function Player({z,color}:{z:number;color:string}) {return <mesh position={[0,.55,z]} castShadow><capsuleGeometry args={[.22,.65,8,16]}/><meshStandardMaterial color={color}/></mesh>}
function App(){return <main><header><h1>BaroBadminton 3D</h1><p>{vi.menu.localMultiplayer} · {vi.gameplay.playerOne} / {vi.gameplay.playerTwo}</p></header><section className="scene"><Canvas shadows camera={{position:[10,12,14],fov:48}}><ambientLight intensity={1.1}/><directionalLight position={[3,12,5]} intensity={2} castShadow/><Court/><Player z={-4} color="#f0b44c"/><Player z={4} color="#56b9ed"/></Canvas></section><footer><p>Đang phát triển sân thi đấu 3D. Chức năng đánh cầu chưa sẵn sàng.</p></footer></main>}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
