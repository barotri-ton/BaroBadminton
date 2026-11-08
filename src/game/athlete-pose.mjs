// Pure, frame-rate independent pose targets for lightweight 3D badminton athletes.
export function athletePose({dx=0,dz=0,dt=1/60,stride=0,shot='clear',swingProgress=1}={}) {
  const speed = Math.hypot(dx,dz)/Math.max(dt,1/240);
  const motion = Math.min(1, speed/5);
  const nextStride = stride + Math.min(Math.hypot(dx,dz),0.2)*12;
  const gait = Math.sin(nextStride)*0.42*motion;
  const lateral = Math.max(-0.2,Math.min(0.2,dx*0.4));
  const active = swingProgress>=0 && swingProgress<1;
  const power = shot==='smash'?2:shot==='drop'?0.75:1.5;
  const swing = active?Math.sin(swingProgress*Math.PI)*power:0;
  return {stride:nextStride,gait,lateral,leanX:Math.max(-0.12,Math.min(0.12,dz*0.65)),leanZ:Math.max(-0.16,Math.min(0.16,-dx*0.9)),swing,jump:shot==='smash'&&active?Math.sin(swingProgress*Math.PI)*0.23:0};
}
