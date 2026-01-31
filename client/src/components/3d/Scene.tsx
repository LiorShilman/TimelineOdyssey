import { Suspense, useRef, useEffect } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import type { Moment } from '../../types/api.types';
import { transformMomentsTo3D, generateSpiralCurve } from '../../utils/3dHelpers';
import Galaxy from './Galaxy';
import RelationConstellation from './RelationConstellation';
import * as THREE from 'three';

interface SceneProps {
  moments: Moment[];
  allMoments?: Moment[];
  onMomentClick: (moment: Moment) => void;
  selectedMoment: Moment | null;
  viewMode: 'galaxy' | 'relations';
  dimmedIds?: Set<string> | null;
}

export default function Scene({ moments, allMoments, onMomentClick, selectedMoment, viewMode, dimmedIds }: SceneProps) {
  const controlsRef = useRef<any>(null);

  return (
    <>
      {/* Camera setup - wider view for dramatic spiral */}
      <PerspectiveCamera
        makeDefault
        position={viewMode === 'relations' ? [0, 8, 12] : [25, 15, 25]}
        fov={65}
      />

      {/* Camera controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={viewMode === 'relations' ? 5 : 8}
        maxDistance={viewMode === 'relations' ? 30 : 80}
        maxPolarAngle={Math.PI}
        minPolarAngle={0}
        autoRotate={viewMode === 'relations' ? false : !selectedMoment}
        autoRotateSpeed={0.3}
      />

      {/* Keyboard vertical pan — Up/Down arrows */}
      <KeyboardPanController controlsRef={controlsRef} />

      {/* Camera animation controller — only active in galaxy view */}
      {viewMode === 'galaxy' && (
        <CameraController
          moments={moments}
          selectedMoment={selectedMoment}
          controlsRef={controlsRef}
        />
      )}

      {/* Reposition camera when switching to relations view */}
      {viewMode === 'relations' && selectedMoment && (
        <ConstellationCameraSetup controlsRef={controlsRef} />
      )}

      {/* Lighting */}
      <Lighting />

      {/* Main content */}
      <Suspense fallback={<LoadingPlaceholder />}>
        {viewMode === 'relations' && selectedMoment ? (
          <RelationConstellation
            selectedMoment={selectedMoment}
            allMoments={allMoments || moments}
            onMomentClick={onMomentClick}
          />
        ) : (
          <Galaxy
            moments={moments}
            onMomentClick={onMomentClick}
            selectedMoment={selectedMoment}
            dimmedIds={dimmedIds}
          />
        )}
      </Suspense>
    </>
  );
}

/**
 * One-shot camera repositioning when entering the constellation view.
 */
function ConstellationCameraSetup({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 8, 12);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [camera, controlsRef]);

  return null;
}

/**
 * Vertical pan via Up/Down arrow keys.
 * Moves camera + OrbitControls target together (same as SHIFT + drag),
 * with speed proportional to the current distance so it feels consistent at any zoom level.
 */
function KeyboardPanController({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const { camera } = useThree();
  const keysDown = useRef<Set<string>>(new Set());

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        keysDown.current.add(e.key);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysDown.current.delete(e.key);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((_state, delta) => {
    if (!controlsRef.current || keysDown.current.size === 0) return;

    const dist = camera.position.distanceTo(controlsRef.current.target);
    const speed = dist * 0.8;
    let dy = 0;
    if (keysDown.current.has('ArrowUp')) dy += speed * delta;
    if (keysDown.current.has('ArrowDown')) dy -= speed * delta;

    if (dy !== 0) {
      camera.position.y += dy;
      controlsRef.current.target.y += dy;
      controlsRef.current.update();
    }
  });

  return null;
}

/**
 * Camera controller that follows the spiral path between moments.
 * When navigating between two known moments the camera travels along
 * the galaxy arm (radially-offset spiral points fed into a CatmullRom curve).
 * On the very first click (no previous moment) it falls back to a simple
 * arc that is pushed outward so it never cuts through the center.
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
  const isAnimating = useRef(false);
  const animationProgress = useRef(0);
  const animSpeed = useRef(0.8);
  const cameraCurve = useRef<THREE.CatmullRomCurve3 | null>(null);
  const targetCurve = useRef<THREE.CatmullRomCurve3 | null>(null);
  const prevMomentId = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedMoment) {
      // If we were previously on a moment, animate back to the default overview position
      if (prevMomentId.current) {
        const startCamPos = camera.position.clone();
        const startTarget = controlsRef.current
          ? controlsRef.current.target.clone()
          : new THREE.Vector3();

        const endCamPos = new THREE.Vector3(25, 15, 25);
        const endTarget = new THREE.Vector3(0, 0, 0);

        // Arc upward through the midpoint for a smooth return
        const midCam = new THREE.Vector3()
          .addVectors(startCamPos, endCamPos)
          .multiplyScalar(0.5);
        midCam.y += 5;

        const midTarget = new THREE.Vector3()
          .addVectors(startTarget, endTarget)
          .multiplyScalar(0.5);

        cameraCurve.current = new THREE.CatmullRomCurve3([startCamPos, midCam, endCamPos]);
        targetCurve.current = new THREE.CatmullRomCurve3([startTarget, midTarget, endTarget]);

        const pathLen = cameraCurve.current.getLength();
        animSpeed.current = Math.max(0.5, Math.min(1.2, 25 / pathLen));

        isAnimating.current = true;
        animationProgress.current = 0;
      }
      prevMomentId.current = null;
      return;
    }

    // Sort chronologically to derive each moment's normalizedAge (0–1)
    const sorted = [...moments].sort(
      (a, b) => new Date(a.momentDate).getTime() - new Date(b.momentDate).getTime()
    );
    const total = sorted.length;
    const currentIdx = sorted.findIndex(m => m.id === selectedMoment.id);
    if (currentIdx === -1) return;
    const currentT = total > 1 ? currentIdx / (total - 1) : 0.5;

    // 3D position of the target moment
    const moments3D = transformMomentsTo3D(moments);
    const selectedMoment3D = moments3D.find(m => m.id === selectedMoment.id);
    if (!selectedMoment3D) return;
    const momentPos = selectedMoment3D.position;

    // End camera position: offset radially outward from the moment
    const camDistance = 8;
    const endAngle = Math.atan2(momentPos.z, momentPos.x);
    const endCamPos = momentPos.clone().add(new THREE.Vector3(
      Math.cos(endAngle) * camDistance,
      camDistance * 0.6,
      Math.sin(endAngle) * camDistance
    ));
    const endTarget = momentPos.clone();

    // Snapshot current camera state
    const startCamPos = camera.position.clone();
    const startTarget = controlsRef.current
      ? controlsRef.current.target.clone()
      : new THREE.Vector3();

    // Previous moment's normalizedAge (null on first click)
    let prevT: number | null = null;
    if (prevMomentId.current) {
      const prevIdx = sorted.findIndex(m => m.id === prevMomentId.current);
      if (prevIdx !== -1) {
        prevT = total > 1 ? prevIdx / (total - 1) : 0.5;
      }
    }

    let camPoints: THREE.Vector3[];
    let targetPoints: THREE.Vector3[];

    if (prevT !== null && prevT !== currentT) {
      // ── Follow the spiral between previous and current moment ──
      const tMin = Math.min(prevT, currentT);
      const tMax = Math.max(prevT, currentT);
      const spiralPoints = generateSpiralCurve(tMin, tMax, 20);
      if (prevT > currentT) spiralPoints.reverse();

      // Camera path: each spiral point offset radially outward
      camPoints = spiralPoints.map(p => {
        const a = Math.atan2(p.z, p.x);
        return new THREE.Vector3(
          p.x + Math.cos(a) * camDistance,
          p.y + camDistance * 0.6,
          p.z + Math.sin(a) * camDistance
        );
      });
      // Snap first / last to actual positions for a seamless join
      camPoints[0] = startCamPos;
      camPoints[camPoints.length - 1] = endCamPos;

      // LookAt path: follow the spiral itself
      targetPoints = spiralPoints.map(p => p.clone());
      targetPoints[0] = startTarget;
      targetPoints[targetPoints.length - 1] = endTarget;
    } else {
      // ── First click — simple arc, pushed outward from center ──
      const midCam = new THREE.Vector3()
        .addVectors(startCamPos, endCamPos)
        .multiplyScalar(0.5);

      const midXZDist = Math.sqrt(midCam.x ** 2 + midCam.z ** 2);
      const avgXZDist = (
        Math.sqrt(startCamPos.x ** 2 + startCamPos.z ** 2) +
        Math.sqrt(endCamPos.x ** 2 + endCamPos.z ** 2)
      ) / 2;

      // If midpoint is too close to center, push it outward
      if (midXZDist < avgXZDist * 0.5) {
        const pushDir = midXZDist > 0.1
          ? new THREE.Vector3(midCam.x, 0, midCam.z).normalize()
          : new THREE.Vector3(startCamPos.x, 0, startCamPos.z).normalize();
        midCam.x = pushDir.x * avgXZDist * 0.7;
        midCam.z = pushDir.z * avgXZDist * 0.7;
      }
      midCam.y += 3;

      camPoints = [startCamPos, midCam, endCamPos];

      const midTarget = new THREE.Vector3()
        .addVectors(startTarget, endTarget)
        .multiplyScalar(0.5);
      targetPoints = [startTarget, midTarget, endTarget];
    }

    cameraCurve.current = new THREE.CatmullRomCurve3(camPoints);
    targetCurve.current = new THREE.CatmullRomCurve3(targetPoints);

    // Scale speed so longer paths take proportionally more time,
    // but stay within a comfortable range
    const pathLen = cameraCurve.current.getLength();
    animSpeed.current = Math.max(0.5, Math.min(1.2, 25 / pathLen));

    isAnimating.current = true;
    animationProgress.current = 0;
    prevMomentId.current = selectedMoment.id;
  }, [selectedMoment, moments, camera, controlsRef]);

  useFrame((_state, delta) => {
    if (!isAnimating.current || !cameraCurve.current || !targetCurve.current || !controlsRef.current) return;

    animationProgress.current += delta * animSpeed.current;
    if (animationProgress.current >= 1) {
      animationProgress.current = 1;
      isAnimating.current = false;
    }

    // Ease-in-out cubic: slow departure → accelerate → slow arrival
    const raw = animationProgress.current;
    const t = raw < 0.5
      ? 4 * raw * raw * raw
      : 1 - Math.pow(-2 * raw + 2, 3) / 2;

    camera.position.copy(cameraCurve.current.getPoint(t));
    controlsRef.current.target.copy(targetCurve.current.getPoint(t));
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
