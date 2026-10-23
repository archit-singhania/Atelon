import { Suspense, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, Html, useGLTF } from '@react-three/drei';
import { Box3, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import type { Vehicle } from '../types';
import { dimensionRecord } from '../features/atlas/shared';
function Profile({vehicle,index}:{vehicle:Vehicle;index:number}) {
 const {scene}=useGLTF(vehicle.model3d!.glb,false,true);
 const prepared=useMemo(()=>{const model=scene.clone(true);const box=new Box3().setFromObject(model);const size=box.getSize(new Vector3());const center=box.getCenter(new Vector3());const material=new MeshBasicMaterial({color:index%2?'#99b9d3':'#c8a882'});model.traverse(object=>{if((object as Mesh).isMesh)(object as Mesh).material=material;});return{model,material,size,center,box};},[scene,index]);
 useEffect(()=>()=>prepared.material.dispose(),[prepared]);
 const length=dimensionRecord(vehicle)!.length;
 const scale=length/Math.max(prepared.size.x,prepared.size.z,.001);
 return <group position={[0,-index*2.8,0]} scale={scale} rotation={[0,prepared.size.z>prepared.size.x?Math.PI/2:0,0]}><group position={[-prepared.center.x,-prepared.box.min.y,-prepared.center.z]}><primitive object={prepared.model}/></group></group>;
}
export default function SilhouetteScene({vehicles}:{vehicles:Vehicle[]}) {
 return <Canvas orthographic frameloop="demand" dpr={[1,1.5]} camera={{position:[0,1,20],zoom:70,near:.01,far:10000}} gl={{antialias:true,alpha:true}}><Suspense fallback={<Html center><span className="silhouette-loading" role="status">Preparing profiles…</span></Html>}><Bounds fit clip observe margin={1.2} maxDuration={0}>{vehicles.map((v,i)=><Profile key={v.slug} vehicle={v} index={i}/>)}</Bounds></Suspense></Canvas>;
}
