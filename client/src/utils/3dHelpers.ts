import type { Moment } from '../types/api.types';
import * as THREE from 'three';

// Emotion colors matching the design system
export const EMOTION_COLORS_3D = {
  happy: '#FFD700',      // Gold
  sad: '#4169E1',        // Royal Blue
  exciting: '#FF6347',   // Tomato Orange
  nostalgic: '#9370DB',  // Medium Purple
  neutral: '#A9A9A9',    // Dark Gray
};

export interface Moment3DPosition {
  id: string;
  position: THREE.Vector3;
  color: string;
  size: number;
  moment: Moment;
}

/**
 * Calculate the 3D position of a moment on the spiral timeline
 * Older moments are in the center, newer ones spiral outward
 */
export function calculateMomentPosition(
  moment: Moment,
  allMoments: Moment[],
  userBirthDate?: Date
): THREE.Vector3 {
  // Sort moments by date to get the timeline
  const sortedMoments = [...allMoments].sort(
    (a, b) => new Date(a.momentDate).getTime() - new Date(b.momentDate).getTime()
  );

  const momentIndex = sortedMoments.findIndex(m => m.id === moment.id);
  const totalMoments = sortedMoments.length;

  if (momentIndex === -1) {
    return new THREE.Vector3(0, 0, 0);
  }

  // Normalize position (0 to 1) based on timeline
  const normalizedAge = totalMoments > 1 ? momentIndex / (totalMoments - 1) : 0.5;

  // Logarithmic spiral parameters - MORE DRAMATIC
  const spiralTightness = 1; // How tight the spiral is
  const spiralRotations = 6; // Number of full rotations (more dramatic)
  const maxRadius = 30; // Maximum distance from center (wider)
  const verticalSpread = 15; // Height variation (more vertical drama)

  // Calculate angle (increases as we go further)
  const angle = normalizedAge * Math.PI * 2 * spiralRotations;

  // Calculate radius (logarithmic growth)
  const radius = spiralTightness + normalizedAge * maxRadius;

  // Add wave effect to make it more organic
  const waveAmplitude = 2;
  const waveFrequency = 3;
  const waveOffset = Math.sin(normalizedAge * Math.PI * waveFrequency) * waveAmplitude;

  // Calculate position with wave
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius + waveOffset;
  const y = (normalizedAge - 0.5) * verticalSpread;

  return new THREE.Vector3(x, y, z);
}

/**
 * Get the color for a moment based on its emotion
 */
export function getMomentColor(moment: Moment): string {
  return EMOTION_COLORS_3D[moment.emotion || 'neutral'];
}

/**
 * Calculate the size of a bubble based on importance (1-5)
 */
export function getMomentSize(moment: Moment): number {
  const baseSize = 0.3;
  const importance = moment.importance || 3;
  return baseSize + (importance - 1) * 0.2; // 0.3 to 1.1
}

/**
 * Transform all moments into 3D positioned objects
 */
export function transformMomentsTo3D(
  moments: Moment[],
  userBirthDate?: Date
): Moment3DPosition[] {
  return moments.map((moment) => ({
    id: moment.id,
    position: calculateMomentPosition(moment, moments, userBirthDate),
    color: getMomentColor(moment),
    size: getMomentSize(moment),
    moment,
  }));
}

/**
 * Generate smooth spiral curve points between two normalizedAge values.
 * Uses the same formula as calculateMomentPosition so the curve passes
 * exactly through each moment's position.
 */
export function generateSpiralCurve(startT: number, endT: number, steps: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = startT + (endT - startT) * (i / steps);

    const angle = t * Math.PI * 2 * 6;
    const radius = 1 + t * 30;
    const waveOffset = Math.sin(t * Math.PI * 3) * 2;

    points.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      (t - 0.5) * 15,
      Math.sin(angle) * radius + waveOffset
    ));
  }
  return points;
}

/**
 * Calculate camera position to view all moments
 */
export function calculateOptimalCameraPosition(
  moments: Moment3DPosition[]
): THREE.Vector3 {
  if (moments.length === 0) {
    return new THREE.Vector3(0, 5, 15);
  }

  // Calculate bounding box
  const positions = moments.map(m => m.position);
  const box = new THREE.Box3();
  positions.forEach(pos => box.expandByPoint(pos));

  const center = new THREE.Vector3();
  box.getCenter(center);

  const size = new THREE.Vector3();
  box.getSize(size);

  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = maxDim * 1.5;

  return new THREE.Vector3(
    center.x + distance * 0.7,
    center.y + distance * 0.5,
    center.z + distance * 0.7
  );
}
