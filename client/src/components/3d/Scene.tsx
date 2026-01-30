import { Suspense, useRef, useEffect } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import type { Moment } from '../../types/api.types';
import { transformMomentsTo3D } from '../../utils/3dHelpers';
import Galaxy from './Galaxy';
import * as THREE from 'three';

interface SceneProps {
  moments: Moment[];
  onMomentClick: (moment: Moment) => void;
  selectedMoment: Moment | null;
}

export default function Scene({ moments, onMomentClick, selectedMoment }: SceneProps) {
  const controlsRef = useRef<any>(null);

  return (
    <>
      {/* Camera setup - wider view for dramatic spiral */}
      <PerspectiveCamera
        makeDefault
        position={[25, 15, 25]}
        fov={65}
      />

      {/* Camera controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={80}
        maxPolarAngle={Math.PI}
        minPolarAngle={0}
        autoRotate={!selectedMoment}
        autoRotateSpeed={0.3}
      />

      {/* Camera animation controller */}
      <CameraController
        moments={moments}
        selectedMoment={selectedMoment}
        controlsRef={controlsRef}
      />

      {/* Lighting */}
      <Lighting />

      {/* Main content */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <Galaxy
          moments={moments}
          onMomentClick={onMomentClick}
          selectedMoment={selectedMoment}
        />
      </Suspense>

      {/* Grid helper (optional, for debugging) */}
      {/* <gridHelper args={[50, 50]} /> */}
    </>
  );
}

/**
 * Camera controller that smoothly moves camera to selected moment
 */
function CameraController({
  moments,
  selectedMoment,
  controlsRef
}: {
  moments: Moment[];
  selectedMoment: Moment | null;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const isAnimating = useRef(false);
  const animationProgress = useRef(0);
  const initialCameraPos = useRef(new THREE.Vector3());
  const initialTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!selectedMoment) return;

    // Find the 3D position of the selected moment
    const moments3D = transformMomentsTo3D(moments);
    const selectedMoment3D = moments3D.find(m => m.id === selectedMoment.id);

    if (!selectedMoment3D) return;

    const momentPos = selectedMoment3D.position;

    // Store initial positions
    initialCameraPos.current.copy(camera.position);
    if (controlsRef.current) {
      initialTarget.current.copy(controlsRef.current.target);
    }

    // Calculate camera position - offset from the moment for better view
    const distance = 8; // Distance from moment
    const angle = Math.atan2(momentPos.z, momentPos.x);

    const offset = new THREE.Vector3(
      Math.cos(angle) * distance,
      distance * 0.6,
      Math.sin(angle) * distance
    );

    targetPosition.current.copy(momentPos).add(offset);
    targetLookAt.current.copy(momentPos);

    // Start animation
    isAnimating.current = true;
    animationProgress.current = 0;
  }, [selectedMoment, moments, camera, controlsRef]);

  useFrame((state, delta) => {
    if (!isAnimating.current || !controlsRef.current) return;

    // Smooth animation using easing
    animationProgress.current += delta * 1.5; // Animation speed

    if (animationProgress.current >= 1) {
      animationProgress.current = 1;
      isAnimating.current = false;
    }

    // Easing function (ease out cubic)
    const t = 1 - Math.pow(1 - animationProgress.current, 3);

    // Animate camera position
    camera.position.lerpVectors(initialCameraPos.current, targetPosition.current, t);

    // Animate controls target (what the camera looks at)
    controlsRef.current.target.lerpVectors(initialTarget.current, targetLookAt.current, t);
    controlsRef.current.update();
  });

  return null;
}

/**
 * Dramatic lighting setup for the galaxy scene
 */
function Lighting() {
  return (
    <>
      {/* Darker ambient light for more drama */}
      <ambientLight intensity={0.2} />

      {/* Main directional light from above */}
      <directionalLight
        position={[20, 20, 10]}
        intensity={1}
        castShadow
        color="#ffffff"
      />

      {/* Fill light from below */}
      <directionalLight
        position={[-10, -10, -5]}
        intensity={0.4}
        color="#4169E1"
      />

      {/* Center glow - purple */}
      <pointLight
        position={[0, 0, 0]}
        color="#9370DB"
        intensity={2}
        distance={40}
      />

      {/* Accent lights for depth */}
      <pointLight
        position={[15, 10, 15]}
        color="#FFD700"
        intensity={1}
        distance={25}
      />

      <pointLight
        position={[-15, -5, -15]}
        color="#FF6347"
        intensity={0.8}
        distance={25}
      />

      {/* Hemisphere light for space feel */}
      <hemisphereLight
        args={['#0f0f23', '#1a1a2e', 0.3]}
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
