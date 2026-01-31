import { useState } from 'react';
import type { Moment, MomentRelation } from '../../types/api.types';
import * as relationService from '../../services/relationService';

const RELATION_TYPES = [
  { value: 'same_people' as const, label: 'אותה משפחה / אנשים', color: '#FF69B4', emoji: '👨‍👩‍👧' },
  { value: 'same_location' as const, label: 'אותה מקום', color: '#32CD32', emoji: '📍' },
  { value: 'same_event' as const, label: 'אותה אירוע', color: '#FFD700', emoji: '🎭' },
];

interface RelationManagerProps {
  momentId: string;
  existingRelations: MomentRelation[];
  allMoments: Moment[];
  onRelationsChange?: () => void;
}

export default function RelationManager({
  momentId,
  existingRelations,
  allMoments,
  onRelationsChange,
}: RelationManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMomentId, setSelectedMomentId] = useState('');
  const [selectedType, setSelectedType] = useState<'same_people' | 'same_location' | 'same_event'>('same_event');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Moments available to link (exclude self + already linked)
  const available = allMoments.filter(
    m => m.id !== momentId && !existingRelations.some(r => r.relatedMomentId === m.id)
  ).sort((a, b) => new Date(b.momentDate).getTime() - new Date(a.momentDate).getTime());

  const handleCreate = async () => {
    if (!selectedMomentId) return;
    setIsCreating(true);
    setError(null);
    try {
      await relationService.createRelation({
        momentId,
        relatedMomentId: selectedMomentId,
        relationType: selectedType,
      });
      setSelectedMomentId('');
      onRelationsChange?.();
    } catch {
      setError('שגיאה ביצירת קשר');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (relatedMomentId: string) => {
    setError(null);
    try {
      await relationService.deleteRelation(momentId, relatedMomentId);
      onRelationsChange?.();
    } catch {
      setError('שגיאה בהסרת קשר');
    }
  };

  return (
    <div>
      {/* Existing relations as pills */}
      <div className="flex flex-wrap gap-2">
        {existingRelations.map(rel => {
          const typeInfo = RELATION_TYPES.find(t => t.value === rel.relationType);
          return (
            <div
              key={rel.relatedMomentId}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800"
            >
              <span style={{ color: typeInfo?.color }}>{typeInfo?.emoji}</span>
              <span className="text-white text-xs truncate max-w-[100px]">{rel.relatedMoment.title}</span>
              <button
                onClick={() => handleDelete(rel.relatedMomentId)}
                className="text-gray-500 hover:text-red-400 text-xs"
              >
                ✕
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1.5 rounded-lg border border-gray-600 hover:border-purple-500 text-gray-400 hover:text-purple-400 text-xs transition-colors"
        >
          {existingRelations.length === 0 ? '+ קשר אירועים' : '+ עוד קשר'}
        </button>
      </div>

      {/* Add-relation form */}
      {isOpen && (
        <div className="mt-3 bg-gray-800 border border-gray-600 rounded-lg p-3">
          {/* Relation type selector */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {RELATION_TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => setSelectedType(type.value)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                  selectedType === type.value ? 'text-white' : 'border border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
                style={
                  selectedType === type.value
                    ? { backgroundColor: type.color + '33', border: `1px solid ${type.color}` }
                    : {}
                }
              >
                <span>{type.emoji}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>

          {/* Target moment dropdown */}
          <select
            value={selectedMomentId}
            onChange={e => setSelectedMomentId(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="">בחר אירוע לקשר...</option>
            {available.map(m => (
              <option key={m.id} value={m.id}>
                {m.title} — {new Date(m.momentDate).toLocaleDateString('he-IL')}
              </option>
            ))}
          </select>

          {available.length === 0 && (
            <p className="text-gray-500 text-xs mt-1">אין אירועים נוספים לקשר</p>
          )}

          {/* Submit + cancel */}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={!selectedMomentId || isCreating}
              className="flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white text-xs transition-colors"
            >
              {isCreating ? '...' : 'צור קשר'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 border border-gray-600 rounded-lg text-gray-400 text-xs hover:border-gray-500"
            >
              בטל
            </button>
          </div>

          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}
