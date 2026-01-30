import { useMemo } from 'react';
import { Stars, Line } from '@react-three/drei';
import type { Moment } from '../../types/api.types';
import { transformMomentsTo3D } from '../../utils/3dHelpers';
import MomentBubble from './MomentBubble';
import * as THREE from 'three';

interface GalaxyProps {
  moments: Moment[];
  onMomentClick: (moment: Moment) => void;
  selectedMoment?: Moment | null;
}

export default function Galaxy({ moments, onMomentClick, selectedMoment }: GalaxyProps) {
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
          isSelected={selectedMoment?.id === moment3D.id}
        />
      ))}

      {/* Nebula effect around the spiral */}
      <NebulaCloud moments={moments3D} />

      {/* Spiral path visualization (glowing guide) */}
      <SpiralPath moments={moments3D} />
    </>
  );
}

/**
 * Ambient floating particles for atmosphere
 */
function AmbientParticles() {
  const particles = useMemo(() => {
    const positions = new Float32Array(2000 * 3); // Increased count
    for (let i = 0; i < 2000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 10 + Math.random() * 40; // Wider spread

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
        size={0.08} // Slightly larger
        color="#8B5CF6"
        transparent
        opacity={0.4} // More visible
        sizeAttenuation
      />
    </points>
  );
}

/**
 * Nebula-like cloud effect following the spiral path
 */
function NebulaCloud({ moments }: { moments: ReturnType<typeof transformMomentsTo3D> }) {
  const nebulaParticles = useMemo(() => {
    if (moments.length < 2) return new Float32Array(0);

    const particlesPerSegment = 50;
    const sorted = [...moments].sort((a, b) => {
      const distA = a.position.length();
      const distB = b.position.length();
      return distA - distB;
    });

    const positions: number[] = [];

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i].position;
      const next = sorted[i + 1].position;

      // Create particles between each pair of moments
      for (let j = 0; j < particlesPerSegment; j++) {
        const t = j / particlesPerSegment;

        // Interpolate position
        const x = current.x + (next.x - current.x) * t;
        const y = current.y + (next.y - current.y) * t;
        const z = current.z + (next.z - current.z) * t;

        // Add random offset for cloud effect
        const offsetRadius = 0.5 + Math.random() * 1.5;
        const offsetAngle = Math.random() * Math.PI * 2;

        positions.push(
          x + Math.cos(offsetAngle) * offsetRadius,
          y + (Math.random() - 0.5) * 1,
          z + Math.sin(offsetAngle) * offsetRadius
        );
      }
    }

    return new Float32Array(positions);
  }, [moments]);

  if (nebulaParticles.length === 0) return null;

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={nebulaParticles.length / 3}
          array={nebulaParticles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#C084FC"
        transparent
        opacity={0.2}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Glowing spiral path connecting the moments
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
    <>
      {/* Main glowing spiral line using Line from drei */}
      <Line
        points={pathPoints}
        color="#9370DB"
        lineWidth={3}
        transparent
        opacity={0.6}
      />

      {/* Secondary thicker glow effect */}
      <Line
        points={pathPoints}
        color="#8B5CF6"
        lineWidth={8}
        transparent
        opacity={0.15}
      />

      {/* Connection lines between consecutive moments */}
      {pathPoints.map((point, i) => {
        if (i === pathPoints.length - 1) return null;
        const nextPoint = pathPoints[i + 1];

        return (
          <group key={i}>
            {/* Thin connecting line */}
            <Line
              points={[point, nextPoint]}
              color="#A78BFA"
              lineWidth={1.5}
              transparent
              opacity={0.3}
            />

            {/* Light source along the path */}
            <pointLight
              position={[
                (point.x + nextPoint.x) / 2,
                (point.y + nextPoint.y) / 2,
                (point.z + nextPoint.z) / 2
              ]}
              color="#9370DB"
              intensity={0.5}
              distance={3}
            />
          </group>
        );
      })}
    </>
  );
}
