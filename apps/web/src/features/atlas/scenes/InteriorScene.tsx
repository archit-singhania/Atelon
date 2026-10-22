import ResearchCanvas from './ResearchCanvas';
import { Clone,OrbitControls,useGLTF } from '@react-three/drei';
import type { Vehicle } from '../../../types';
export default function InteriorScene({vehicle,seat}:{vehicle:Vehicle;seat:{id:string;position:[number,number,number];target:[number,number,number]}}){const {scene}=useGLTF(vehicle.model3d!.glb,false,true);return <ResearchCanvas key={seat.id} camera={{position:seat.position,fov:70,near:.005}}><hemisphereLight intensity={2}/><directionalLight position={[2,5,2]} intensity={2}/><Clone object={scene} deep/><OrbitControls target={seat.target} enablePan={false} minDistance={.01} maxDistance={.5}/></ResearchCanvas>;}
