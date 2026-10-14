import { Navigate, useParams } from 'react-router-dom';
import ModelViewer from '../components/ModelViewer';
import { vehicles } from '../lib/data';

export default function PosterStudio() {
  const { slug } = useParams();
  const vehicle = vehicles.find((item) => item.slug === slug);
  if (!vehicle?.model3d) return <Navigate to="/" replace />;

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: 'radial-gradient(circle at 50% 35%, #27313f 0%, #10151d 42%, #07090d 100%)' }}>
      <div style={{ position: 'absolute', inset: '4%', borderRadius: '5vw', background: 'radial-gradient(ellipse at 50% 88%, rgba(105, 205, 255, .13), transparent 48%)' }} />
      <ModelViewer url={vehicle.model3d.glb} />
    </div>
  );
}
