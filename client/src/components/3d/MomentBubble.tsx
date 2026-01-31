import { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Moment } from '../../types/api.types';

interface MomentBubbleProps {
  moment: Moment;
  position: THREE.Vector3;
  color: string;
  size: number;
  onClick: (moment: Moment) => void;
  isSelected?: boolean;
  hasRelations?: boolean;
}

export default function MomentBubble({
  moment,
  position,
  color,
  size,
  onClick,
  isSelected = false,
  hasRelations = false,
}: MomentBubbleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Get first image from moment's media
  const firstImage = useMemo(() => {
    const imageFile = moment.mediaFiles?.find((m) => m.fileType === 'image');
    return imageFile?.thumbnailUrl || imageFile?.url;
  }, [moment.mediaFiles]);

  // Load texture if image exists
  const texture = firstImage ? useLoader(THREE.TextureLoader, firstImage) : null;

  const ringRef = useRef<THREE.Mesh>(null);

  // Gentle floating animation
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();

      // Gentle bobbing motion
      meshRef.current.position.y = position.y + Math.sin(time * 0.5 + position.x) * 0.1;

      // Slow rotation
      meshRef.current.rotation.y += 0.003;

      // Scale: only slight bump on hover, no change on selected (camera zooms instead)
      const targetScale = hovered && !isSelected ? 1.2 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }

    // Animate selection ring pulse
    if (ringRef.current && isSelected) {
      const time = state.clock.getElapsedTime();
      const pulse = 1 + Math.sin(time * 2) * 0.08;
      ringRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick(moment);
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
            emissiveIntensity={hovered ? 0.1 : 0.03}
            metalness={0.05}
            roughness={0.15}
            transparent
            opacity={0.7}
          />
        ) : (
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 0.6 : (hovered ? 0.35 : 0.2)}
            metalness={0.3}
            roughness={0.4}
            transparent
            opacity={isSelected ? 0.8 : 0.65}
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
        intensity={isSelected ? 2 : (hovered ? 1.5 : 0.4)}
        distance={isSelected ? size * 5 : size * 3}
      />

      {/* Connection indicator — quiet ring on bubbles that have relations */}
      {hasRelations && !isSelected && (
        <mesh position={[position.x, position.y, position.z]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 1.12, size * 1.18, 64]} />
          <meshBasicMaterial
            color="#A78BFA"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Selection rings - pulsing outer indicator */}
      {isSelected && (
        <group position={[position.x, position.y, position.z]}>
          {/* Inner ring - solid */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size * 1.15, size * 1.25, 64]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Outer ring - pulsing, colored */}
          <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size * 1.35, size * 1.55, 64]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
