import { Component,useEffect,useState,type ReactNode } from 'react';
import { Canvas,useThree,type CanvasProps } from '@react-three/fiber';
import { reportRenderer } from '../../../lib/useDeviceTier';
class SceneBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<div className="placeholder"><p>The 3D scene could not load. Sourced information remains available below.</p><button className="btn ghost" onClick={()=>this.setState({failed:false})}>Retry scene</button></div>:this.props.children;}
}
function ContextEvents({lost,restored}:{lost:()=>void;restored:()=>void}){
 const {gl,invalidate}=useThree();
 useEffect(()=>{const canvas=gl.domElement;const onLost=(event:Event)=>{event.preventDefault();lost();};const onRestored=()=>{restored();invalidate();};canvas.addEventListener('webglcontextlost',onLost);canvas.addEventListener('webglcontextrestored',onRestored);return()=>{canvas.removeEventListener('webglcontextlost',onLost);canvas.removeEventListener('webglcontextrestored',onRestored);};},[gl,invalidate,lost,restored]);return null;
}
export default function ResearchCanvas({children,camera}:Pick<CanvasProps,'children'|'camera'>){
 const [lost,setLost]=useState(false);const [revision,setRevision]=useState(0);const [visible,setVisible]=useState(!document.hidden);
 useEffect(()=>{const change=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',change);return()=>document.removeEventListener('visibilitychange',change);},[]);
 return <><SceneBoundary key={revision}><Canvas fallback={<p className="atlas-status">WebGL is unavailable. Sourced information remains available below.</p>} frameloop={visible&&!lost?'demand':'never'} dpr={[1,1.25]} camera={camera} onCreated={({gl})=>reportRenderer(gl)} gl={{powerPreference:'low-power'}}><ContextEvents lost={()=>setLost(true)} restored={()=>setLost(false)}/>{children}</Canvas></SceneBoundary>{lost&&<div className="model-consent" role="alert"><p>The graphics context was interrupted.</p><button className="btn primary" onClick={()=>{setLost(false);setRevision(value=>value+1);}}>Restart 3D scene</button></div>}</>;
}
