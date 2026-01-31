import { useMemo, useState, useCallback } from 'react';
import { Stars, Line } from '@react-three/drei';
import type { Moment } from '../../types/api.types';
import { transformMomentsTo3D, generateSpiralCurve } from '../../utils/3dHelpers';
import MomentBubble from './MomentBubble';
import * as THREE from 'three';

const RELATION_COLORS: Record<string, string> = {
  same_people: '#FF69B4',
  same_location: '#32CD32',
  same_event: '#FFD700',
};

/**
 * Returns a CanvasTexture with a soft white circle — used as the particle
 * shape so pointsMaterial renders circles instead of squares.
 */
function createCircleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

interface GalaxyProps {
  moments: Moment[];
  onMomentClick: (moment: Moment) => void;
  selectedMoment?: Moment | null;
  dimmedIds?: Set<string> | null;
}

export default function Galaxy({ moments, onMomentClick, selectedMoment, dimmedIds }: GalaxyProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Transform moments to 3D positioned objects
  const moments3D = useMemo(() => {
    return transformMomentsTo3D(moments);
  }, [moments]);

  const handleHoverChange = useCallback((id: string, isHovered: boolean) => {
    setHoveredId(isHovered ? id : null);
  }, []);

  // Compute relation lines for the currently hovered bubble
  const hoverLines = useMemo(() => {
    if (!hoveredId) return [];
    const hovered = moments3D.find(m => m.id === hoveredId);
    if (!hovered || (hovered.moment.relations?.length ?? 0) === 0) return [];

    return (hovered.moment.relations || []).map(rel => {
      const target = moments3D.find(m => m.id === rel.relatedMomentId);
      if (!target) return null;
      // Skip lines to dimmed targets
      if (dimmedIds?.has(target.id)) return null;

      const start = hovered.position;
      const end = target.position;
      const color = RELATION_COLORS[rel.relationType] || '#A78BFA';

      // Offset start/end inward by bubble radii so lines emerge from surfaces
      const dir = new THREE.Vector3().subVectors(end, start).normalize();
      const startOff = start.clone().add(dir.clone().multiplyScalar(hovered.size));
      const endOff = end.clone().add(dir.clone().multiplyScalar(-target.size));

      // Gentle arc: pull midpoint perpendicular to the line
      const mid = new THREE.Vector3().addVectors(startOff, endOff).multiplyScalar(0.5);
      const up = new THREE.Vector3(0, 1, 0);
      const perp = new THREE.Vector3().crossVectors(dir, up).normalize();
      // If dir is nearly vertical, perp will be ~zero; fall back to world X
      if (perp.length() < 0.01) perp.set(1, 0, 0);
      mid.add(perp.multiplyScalar(start.distanceTo(end) * 0.15));

      const curve = new THREE.QuadraticBezierCurve3(startOff, mid, endOff);
      const points = curve.getPoints(24);
      const midPoint = curve.getPoint(0.5);

      return { points, color, mid: midPoint };
    }).filter(Boolean) as { points: THREE.Vector3[]; color: string; mid: THREE.Vector3 }[];
  }, [hoveredId, moments3D, dimmedIds]);

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

      {/* Hover relation lines */}
      {hoverLines.map((line, i) => (
        <group key={i}>
          <Line points={line.points} color={line.color} lineWidth={3} transparent opacity={0.1} />
          <Line points={line.points} color={line.color} lineWidth={1} transparent opacity={0.6} />
          <pointLight position={[line.mid.x, line.mid.y, line.mid.z]} color={line.color} intensity={0.5} distance={5} />
        </group>
      ))}

      {/* Moment bubbles */}
      {moments3D.map((moment3D) => (
        <MomentBubble
          key={moment3D.id}
          moment={moment3D.moment}
          position={moment3D.position}
          color={moment3D.color}
          size={moment3D.size}
          onClick={onMomentClick}
          onHoverChange={handleHoverChange}
          isSelected={selectedMoment?.id === moment3D.id}
          hasRelations={(moment3D.moment.relations?.length ?? 0) > 0}
          isFlagged={moment3D.moment.flagged}
          isDimmed={dimmedIds?.has(moment3D.id) ?? false}
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
  const circleTexture = useMemo(() => createCircleTexture(), []);

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
        size={0.08}
        color="#8B5CF6"
        map={circleTexture}
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * Nebula-like cloud effect following the spiral path
 */
function NebulaCloud({ moments }: { moments: ReturnType<typeof transformMomentsTo3D> }) {
  const circleTexture = useMemo(() => createCircleTexture(), []);

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
        map={circleTexture}
        transparent
        opacity={0.2}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Glowing spiral path connecting the moments with smooth curves.
 * Each segment samples many points along the spiral formula so the
 * path follows the actual curve instead of cutting straight between bubbles.
 */
function SpiralPath({ moments }: { moments: ReturnType<typeof transformMomentsTo3D> }) {
  // Sort chronologically and compute each moment's normalizedAge (0–1)
  const sorted = useMemo(() => {
    return [...moments].sort((a, b) =>
      new Date(a.moment.momentDate).getTime() - new Date(b.moment.momentDate).getTime()
    );
  }, [moments]);

  // Full smooth curve through all moments (dense sampling)
  const fullCurve = useMemo(() => {
    if (sorted.length < 2) return [];
    const total = sorted.length;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < total - 1; i++) {
      const tStart = i / (total - 1);
      const tEnd = (i + 1) / (total - 1);
      // 40 steps per segment — smooth enough for any zoom level
      const segment = generateSpiralCurve(tStart, tEnd, 40);
      // Skip first point of subsequent segments to avoid duplicates
      points.push(...(i === 0 ? segment : segment.slice(1)));
    }
    return points;
  }, [sorted]);

  // Per-segment curves for individual connection lines + midpoint lights
  const segments = useMemo(() => {
    if (sorted.length < 2) return [];
    const total = sorted.length;
    return sorted.map((_, i) => {
      if (i === total - 1) return null;
      const tStart = i / (total - 1);
      const tEnd = (i + 1) / (total - 1);
      const curve = generateSpiralCurve(tStart, tEnd, 40);
      // Midpoint for the light source
      const mid = curve[Math.floor(curve.length / 2)];
      return { curve, mid };
    }).filter(Boolean) as { curve: THREE.Vector3[]; mid: THREE.Vector3 }[];
  }, [sorted]);

  if (fullCurve.length < 2) return null;

  return (
    <>
      {/* Outer glow — thickest, most transparent */}
      <Line
        points={fullCurve}
        color="#8B5CF6"
        lineWidth={8}
        transparent
        opacity={0.15}
      />

      {/* Main glowing spiral */}
      <Line
        points={fullCurve}
        color="#9370DB"
        lineWidth={3}
        transparent
        opacity={0.6}
      />

      {/* Midpoint lights along the spiral */}
      {segments.map((seg, i) => (
        <pointLight
          key={i}
          position={[seg.mid.x, seg.mid.y, seg.mid.z]}
          color="#9370DB"
          intensity={0.5}
          distance={3}
        />
      ))}
    </>
  );
}
