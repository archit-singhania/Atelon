import { useEffect, useMemo } from 'react';
import { ContactShadows, Environment, Lightformer, useGLTF } from '@react-three/drei';
import { Box3, CanvasTexture, Vector3 } from 'three';
import { useDeviceTier } from '../lib/useDeviceTier';
/** Locally generated softbox reflections and feathered ground. No remote HDRI. */
export default function ShowroomEnvironment({url,environment}:{url:string;environment:string}){
 const {scene}=useGLTF(url,false,true);const tier=useDeviceTier();
 const {center,radius,floor}=useMemo(()=>{const box=new Box3().setFromObject(scene);const size=box.getSize(new Vector3());return{center:box.getCenter(new Vector3()),radius:Math.max(size.x,size.y,size.z,.01),floor:box.min.y};},[scene]);
 const mask=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d')!;const gradient=ctx.createRadialGradient(64,64,12,64,64,64);gradient.addColorStop(0,'white');gradient.addColorStop(.35,'#999');gradient.addColorStop(1,'black');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);return new CanvasTexture(canvas);},[]);
 useEffect(()=>()=>mask.dispose(),[mask]);
 const pearl=environment==='pearl';
 return <><Environment key={environment} resolution={tier==='low'?64:128} frames={1}><Lightformer intensity={3} color="#ffffff" position={[0,5,0]} rotation={[Math.PI/2,0,0]} scale={[10,5,1]}/><Lightformer intensity={2.5} color={pearl?'#fff5e7':'#e0efff'} position={[5,1,0]} rotation={[0,-Math.PI/2,0]} scale={[5,4,1]}/><Lightformer intensity={2} color="#ffffff" position={[-5,2,-2]} rotation={[0,Math.PI/2,0]} scale={[8,3,1]}/></Environment><group position={[center.x,floor-radius*.005,center.z]}><mesh rotation={[-Math.PI/2,0,0]}><planeGeometry args={[radius*4,radius*4]}/><meshStandardMaterial color={pearl?'#ccc9c2':environment==='night'?'#141a2b':'#76818a'} alphaMap={mask} transparent opacity={.45} depthWrite={false} roughness={.9}/></mesh>{tier!=='low'&&<ContactShadows position={[0,radius*.002,0]} scale={radius*2.4} opacity={pearl?.22:.35} blur={3} far={radius} resolution={256} frames={1}/>}</group></>;
}
