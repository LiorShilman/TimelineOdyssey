import { useMemo } from 'react';
import { Stars } from '@react-three/drei';
import type { Moment } from '../../types/api.types';
import { transformMomentsTo3D } from '../../utils/3dHelpers';
import MomentBubble from './MomentBubble';

interface GalaxyProps {
  moments: Moment[];
  onMomentClick: (moment: Moment) => void;
}

export default function Galaxy({ moments, onMomentClick }: GalaxyProps) {
  // Transform moments to 3D positioned objects
  const moments3D = useMemo(() => {
    return transformMomentsTo3D(moments);
  }, [moments]);

  return (
    <>
      {/* Background stars */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0.5}
        fade
        speed={0.5}
      />

      {/* Ambient particles in the galaxy */}
      <AmbientParticles />

      {/* Moment bubbles */}
      {moments3D.map((moment3D) => (
        <MomentBubble
          key={moment3D.id}
          moment={moment3D.moment}
          position={moment3D.position}
          color={moment3D.color}
          size={moment3D.size}
          onClick={onMomentClick}
        />
      ))}

      {/* Spiral path visualization (subtle guide) */}
      <SpiralPath moments={moments3D} />
    </>
  );
}

/**
 * Ambient floating particles for atmosphere
 */
function AmbientParticles() {
  const particles = useMemo(() => {
    const positions = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 10 + Math.random() * 30;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#8B5CF6"
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * Subtle spiral path connecting the moments
 */
function SpiralPath({ moments }: { moments: ReturnType<typeof transformMomentsTo3D> }) {
  const pathPoints = useMemo(() => {
    if (moments.length < 2) return [];

    // Sort by position in timeline
    const sorted = [...moments].sort((a, b) => {
      const distA = a.position.length();
      const distB = b.position.length();
      return distA - distB;
    });

    return sorted.map(m => m.position);
  }, [moments]);

  if (pathPoints.length < 2) return null;

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={pathPoints.length}
          array={new Float32Array(pathPoints.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#9370DB"
        transparent
        opacity={0.15}
        linewidth={1}
      />
    </line>
  );
}
