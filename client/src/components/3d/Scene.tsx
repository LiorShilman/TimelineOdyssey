import { Suspense } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { Moment } from '../../types/api.types';
import Galaxy from './Galaxy';

interface SceneProps {
  moments: Moment[];
  onMomentClick: (moment: Moment) => void;
}

export default function Scene({ moments, onMomentClick }: SceneProps) {
  return (
    <>
      {/* Camera setup */}
      <PerspectiveCamera
        makeDefault
        position={[15, 10, 15]}
        fov={60}
      />

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI}
        minPolarAngle={0}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />

      {/* Lighting */}
      <Lighting />

      {/* Main content */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <Galaxy moments={moments} onMomentClick={onMomentClick} />
      </Suspense>

      {/* Grid helper (optional, for debugging) */}
      {/* <gridHelper args={[50, 50]} /> */}
    </>
  );
}

/**
 * Lighting setup for the scene
 */
function Lighting() {
  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.3} />

      {/* Main directional light */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
      />

      {/* Fill light from opposite side */}
      <directionalLight
        position={[-10, -5, -5]}
        intensity={0.3}
      />

      {/* Purple accent light for atmosphere */}
      <pointLight
        position={[0, 5, 0]}
        color="#9370DB"
        intensity={0.5}
        distance={30}
      />

      {/* Hemisphere light for natural ambient */}
      <hemisphereLight
        args={['#87CEEB', '#1a1a2e', 0.4]}
      />
    </>
  );
}

/**
 * Loading placeholder while scene loads
 */
function LoadingPlaceholder() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#9370DB" wireframe />
    </mesh>
  );
}
