import { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Moment } from '../../types/api.types';

interface MomentBubbleProps {
  moment: Moment;
  position: THREE.Vector3;
  color: string;
  size: number;
  onClick: (moment: Moment) => void;
}

export default function MomentBubble({
  moment,
  position,
  color,
  size,
  onClick
}: MomentBubbleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Get first image from moment's media
  const firstImage = useMemo(() => {
    const imageFile = moment.mediaFiles?.find((m) => m.fileType === 'image');
    return imageFile?.thumbnailUrl || imageFile?.url;
  }, [moment.mediaFiles]);

  // Load texture if image exists
  const texture = firstImage ? useLoader(THREE.TextureLoader, firstImage) : null;

  // Gentle floating animation
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();

      // Gentle bobbing motion
      meshRef.current.position.y = position.y + Math.sin(time * 0.5 + position.x) * 0.1;

      // Slow rotation
      meshRef.current.rotation.y += 0.003;

      // Scale on hover
      const targetScale = hovered ? 1.3 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const handleClick = (e: THREE.Event) => {
    e.stopPropagation();
    setClicked(true);
    onClick(moment);
    setTimeout(() => setClicked(false), 200);
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[position.x, position.y, position.z]}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[size, 32, 32]} />
        {texture ? (
          <meshStandardMaterial
            map={texture}
            emissive={color}
            emissiveIntensity={hovered ? 0.3 : 0.1}
            metalness={0.2}
            roughness={0.3}
            transparent
            opacity={0.95}
          />
        ) : (
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.5 : 0.2}
            metalness={0.3}
            roughness={0.4}
            transparent
            opacity={0.9}
          />
        )}
      </mesh>

      {/* Tooltip on hover */}
      {hovered && (
        <Html
          position={[position.x, position.y + size + 0.5, position.z]}
          center
          distanceFactor={8}
        >
          <div className="bg-gray-900 border border-gray-700 px-3 py-2 rounded-lg shadow-xl pointer-events-none">
            <div className="text-white text-sm font-semibold whitespace-nowrap">
              {moment.title}
            </div>
            <div className="text-gray-400 text-xs">
              {new Date(moment.momentDate).toLocaleDateString('he-IL')}
            </div>
          </div>
        </Html>
      )}

      {/* Glow effect */}
      <pointLight
        position={[position.x, position.y, position.z]}
        color={color}
        intensity={hovered ? 2 : 0.5}
        distance={size * 3}
      />
    </group>
  );
}
