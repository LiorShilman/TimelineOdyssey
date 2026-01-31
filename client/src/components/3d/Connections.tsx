import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { Moment } from '../../types/api.types';
import { transformMomentsTo3D } from '../../utils/3dHelpers';

const RELATION_COLORS: Record<string, string> = {
  same_people: '#FF69B4',    // Hot pink
  same_location: '#32CD32',  // Lime green
  same_event: '#FFD700',     // Gold
};

interface ConnectionsProps {
  moments: Moment[];
}

/**
 * Renders curved connection lines between related moments.
 * Lines emerge from the bubble surface (offset by radius) and curve
 * outward so multiple branches from the same bubble fan out like a tree.
 */
export default function Connections({ moments }: ConnectionsProps) {
  const edges = useMemo(() => {
    const moments3D = transformMomentsTo3D(moments);
    const posMap = new Map<string, { position: THREE.Vector3; size: number }>();
    moments3D.forEach(m => posMap.set(m.id, { position: m.position, size: m.size }));

    // Deduplicate edges: each bidirectional pair is drawn once
    const seen = new Set<string>();
    const result: {
      key: string;
      fromId: string;
      toId: string;
      fromPos: THREE.Vector3;
      toPos: THREE.Vector3;
      fromSize: number;
      toSize: number;
      relationType: string;
    }[] = [];

    moments.forEach(moment => {
      (moment.relations || []).forEach(rel => {
        const key = [moment.id, rel.relatedMomentId].sort().join('--');
        if (seen.has(key)) return;
        seen.add(key);

        const from = posMap.get(moment.id);
        const to = posMap.get(rel.relatedMomentId);
        if (!from || !to) return; // target not in visible set

        result.push({
          key,
          fromId: moment.id,
          toId: rel.relatedMomentId,
          fromPos: from.position,
          toPos: to.position,
          fromSize: from.size,
          toSize: to.size,
          relationType: rel.relationType,
        });
      });
    });

    return result;
  }, [moments]);

  // Assign branch indices per bubble for fan spreading
  const edgesWithSpread = useMemo(() => {
    const totalPerBubble = new Map<string, number>();
    edges.forEach(e => {
      totalPerBubble.set(e.fromId, (totalPerBubble.get(e.fromId) || 0) + 1);
      totalPerBubble.set(e.toId, (totalPerBubble.get(e.toId) || 0) + 1);
    });

    const nextIdx = new Map<string, number>();
    return edges.map(e => {
      const fi = nextIdx.get(e.fromId) || 0;
      nextIdx.set(e.fromId, fi + 1);
      const ti = nextIdx.get(e.toId) || 0;
      nextIdx.set(e.toId, ti + 1);
      return {
        ...e,
        fromIdx: fi,
        fromTotal: totalPerBubble.get(e.fromId) || 1,
        toIdx: ti,
        toTotal: totalPerBubble.get(e.toId) || 1,
      };
    });
  }, [edges]);

  return (
    <>
      {edgesWithSpread.map(edge => {
        const dir = new THREE.Vector3().subVectors(edge.toPos, edge.fromPos);
        const dist = dir.length();
        if (dist < 0.01) return null;
        dir.normalize();

        // Offset start/end to bubble surface
        const start = edge.fromPos.clone().add(dir.clone().multiplyScalar(edge.fromSize));
        const end = edge.toPos.clone().add(dir.clone().multiplyScalar(-edge.toSize));

        // Fan angle: spread branches when multiple connections leave one bubble
        const fanRange = Math.PI * 0.5;
        const fromAngle = edge.fromTotal > 1
          ? ((edge.fromIdx / (edge.fromTotal - 1)) - 0.5) * fanRange
          : 0;
        const toAngle = edge.toTotal > 1
          ? ((edge.toIdx / (edge.toTotal - 1)) - 0.5) * fanRange
          : 0;

        // Pull control points radially outward from the galaxy center so the curve
        // bows away from the spiral. Fan angle rotates the pull around the edge axis.
        const outward = new THREE.Vector3().addVectors(edge.fromPos, edge.toPos).normalize();
        const pullDist = Math.max(dist * 0.45, 3.0);
        const cp1 = start.clone().add(
          outward.clone().applyAxisAngle(dir, fromAngle).multiplyScalar(pullDist)
        );
        const cp2 = end.clone().add(
          outward.clone().applyAxisAngle(dir, toAngle).multiplyScalar(pullDist)
        );

        const curve = new THREE.CubicBezierCurve3(start, cp1, cp2, end);
        const mid = curve.getPoint(0.5);
        const points = curve.getPoints(50);

        const color = RELATION_COLORS[edge.relationType] || '#A78BFA';

        return (
          <group key={edge.key}>
            {/* Outer glow */}
            <Line points={points} color={color} lineWidth={5} transparent opacity={0.12} />
            {/* Main line */}
            <Line points={points} color={color} lineWidth={2} transparent opacity={0.7} />
            {/* Branch-point sphere at source surface */}
            <mesh position={start}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.9} />
            </mesh>
            {/* Branch-point sphere at target surface */}
            <mesh position={end}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.9} />
            </mesh>
            {/* Midpoint glow */}
            <pointLight position={[mid.x, mid.y, mid.z]} color={color} intensity={0.4} distance={4} />
          </group>
        );
      })}
    </>
  );
}
