import { useMemo } from 'react';
import { Stars, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { Moment } from '../../types/api.types';
import { getMomentColor, getMomentSize } from '../../utils/3dHelpers';
import MomentBubble from './MomentBubble';

const RELATION_COLORS: Record<string, string> = {
  same_people: '#FF69B4',
  same_location: '#32CD32',
  same_event: '#FFD700',
};

interface RelationConstellationProps {
  selectedMoment: Moment;
  allMoments: Moment[];
  onMomentClick: (moment: Moment) => void;
}

export default function RelationConstellation({
  selectedMoment,
  allMoments,
  onMomentClick,
}: RelationConstellationProps) {
  // Resolve the directly connected moments (full objects from allMoments)
  const connected = useMemo(() => {
    const ids = new Set((selectedMoment.relations || []).map(r => r.relatedMomentId));
    return allMoments
      .filter(m => ids.has(m.id))
      .sort((a, b) => new Date(a.momentDate).getTime() - new Date(b.momentDate).getTime());
  }, [selectedMoment, allMoments]);

  // Layout: selected at center, connected on a circle
  const layout = useMemo(() => {
    const total = connected.length;
    const radius = 5;
    return connected.map((moment, i) => {
      const angle = (i / total) * Math.PI * 2;
      const ySpread = total > 1 ? ((i / (total - 1)) - 0.5) * 3 : 0;
      return {
        moment,
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          ySpread,
          Math.sin(angle) * radius
        ),
        color: getMomentColor(moment),
        size: getMomentSize(moment),
      };
    });
  }, [connected]);

  // Build relation lines from selected → each connected moment
  const lines = useMemo(() => {
    const centerPos = new THREE.Vector3(0, 0, 0);
    const centerSize = getMomentSize(selectedMoment);

    return layout.map((item) => {
      const rel = (selectedMoment.relations || []).find(r => r.relatedMomentId === item.moment.id);
      const color = rel ? (RELATION_COLORS[rel.relationType] || '#A78BFA') : '#A78BFA';

      const dir = item.position.clone().normalize();
      const start = centerPos.clone().add(dir.clone().multiplyScalar(centerSize));
      const end = item.position.clone().add(dir.clone().multiplyScalar(-item.size));

      // Pull control points radially outward for a gentle arc
      const outward = item.position.clone().normalize();
      const pullDist = item.position.length() * 0.3;
      const cp1 = start.clone().add(outward.clone().multiplyScalar(pullDist));
      const cp2 = end.clone().add(outward.clone().multiplyScalar(pullDist));

      const curve = new THREE.CubicBezierCurve3(start, cp1, cp2, end);
      const points = curve.getPoints(40);
      const mid = curve.getPoint(0.5);

      return { points, color, mid };
    });
  }, [layout, selectedMoment]);

  return (
    <>
      <Stars radius={60} depth={40} count={2000} factor={3} saturation={0.3} fade speed={0.3} />

      {/* Selected moment at center */}
      <MomentBubble
        moment={selectedMoment}
        position={new THREE.Vector3(0, 0, 0)}
        color={getMomentColor(selectedMoment)}
        size={getMomentSize(selectedMoment)}
        onClick={onMomentClick}
        isSelected
      />

      {/* Connected moments around the circle */}
      {layout.map((item) => (
        <MomentBubble
          key={item.moment.id}
          moment={item.moment}
          position={item.position}
          color={item.color}
          size={item.size}
          onClick={onMomentClick}
          hasRelations={(item.moment.relations?.length ?? 0) > 0}
        />
      ))}

      {/* Relation lines */}
      {lines.map((line, i) => (
        <group key={i}>
          <Line points={line.points} color={line.color} lineWidth={4} transparent opacity={0.12} />
          <Line points={line.points} color={line.color} lineWidth={2} transparent opacity={0.7} />
          <pointLight position={[line.mid.x, line.mid.y, line.mid.z]} color={line.color} intensity={0.4} distance={4} />
        </group>
      ))}
    </>
  );
}
