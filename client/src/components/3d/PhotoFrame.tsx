import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PhotoFrameProps {
  texture: THREE.Texture;
  bubbleSize: number;
  offsetX: number;
}

export default function PhotoFrame({ texture, bubbleSize, offsetX }: PhotoFrameProps) {
  const frameGroupRef = useRef<THREE.Group>(null);

  // Derive photo dimensions from the texture's actual image, preserving aspect ratio.
  // Cap the longer edge at bubbleSize * 2 so the frame stays proportional to the bubble.
  const maxDim = bubbleSize * 2.4;
  const imgW = texture.image?.width ?? 1;
  const imgH = texture.image?.height ?? 1;
  const aspect = imgW / imgH;
  const photoW = aspect >= 1 ? maxDim : maxDim * aspect;
  const photoH = aspect >= 1 ? maxDim / aspect : maxDim;

  const border = bubbleSize * 0.18;
  const depth = bubbleSize * 0.06;

  const frameW = photoW + border * 2;
  const frameH = photoH + border * 2;

  useFrame((_state, delta) => {
    if (frameGroupRef.current) {
      frameGroupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={frameGroupRef} position={[offsetX, 0, 0]}>
      {/* Frame backing — dark slab with subtle purple emissive glow */}
      <mesh>
        <boxGeometry args={[frameW, frameH, depth]} />
        <meshStandardMaterial
          color="#1a1a2e"
          emissive="#9370DB"
          emissiveIntensity={0.15}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Photo — front face */}
      <mesh position={[0, 0, depth / 2 + 0.001]}>
        <planeGeometry args={[photoW, photoH]} />
        <meshStandardMaterial map={texture} metalness={0.1} roughness={0.5} />
      </mesh>

      {/* Photo — back face (rotated 180° so texture is not mirrored) */}
      <mesh position={[0, 0, -(depth / 2 + 0.001)]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[photoW, photoH]} />
        <meshStandardMaterial map={texture} metalness={0.1} roughness={0.5} />
      </mesh>

      {/* Atmospheric light */}
      <pointLight
        position={[0, 0, depth]}
        color="#C084FC"
        intensity={0.3}
        distance={bubbleSize * 3}
      />
    </group>
  );
}
