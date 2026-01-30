import { useState, useEffect } from 'react';
import type { Tag, MomentTag } from '../../types/api.types';
import * as tagService from '../../services/tagService';

interface TagManagerProps {
  momentId: string;
  existingTags: MomentTag[];
  onTagsChange?: () => void;
}

export default function TagManager({ momentId, existingTags, onTagsChange }: TagManagerProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [attachedTagIds, setAttachedTagIds] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from existing tags
  useEffect(() => {
    setAttachedTagIds(new Set(existingTags.map(mt => mt.tagId)));
  }, [existingTags]);

  // Load all tags when dropdown opens
  useEffect(() => {
    if (isOpen) {
      tagService.getTags()
        .then(tags => setAllTags(tags))
        .catch(() => setError('שגיאה בטעינת תגיות'));
    }
  }, [isOpen]);

  const handleToggleTag = async (tag: Tag) => {
    const isAttached = attachedTagIds.has(tag.id);
    setError(null);

    try {
      if (isAttached) {
        await tagService.detachTagFromMoment(momentId, tag.id);
        setAttachedTagIds(prev => {
          const next = new Set(prev);
          next.delete(tag.id);
          return next;
        });
      } else {
        await tagService.attachTagToMoment(momentId, tag.id);
        setAttachedTagIds(prev => new Set([...prev, tag.id]));
      }

      onTagsChange?.();
    } catch {
      setError(isAttached ? 'שגיאה בהסרת תגית' : 'שגיאה בהוספת תגית');
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setIsCreating(true);
    setError(null);

    try {
      const tag = await tagService.createTag({
        name: newTagName.trim(),
        color: newTagColor || undefined
      });

      // Auto-attach newly created tag
      await tagService.attachTagToMoment(momentId, tag.id);

      setAllTags(prev => [...prev, tag]);
      setAttachedTagIds(prev => new Set([...prev, tag.id]));
      setNewTagName('');
      setNewTagColor('');
      onTagsChange?.();
    } catch {
      setError('שגיאה ביצירת תגית');
    } finally {
      setIsCreating(false);
    }
  };

  const PRESET_COLORS = [
    '#FF6347', '#FFD700', '#9370DB', '#4169E1',
    '#32CD32', '#FF69B4', '#FFA500', '#00CED1',
  ];

  return (
    <div className="relative">
      {/* Current tags display */}
      <div className="flex flex-wrap gap-2 items-center">
        {existingTags.map(mt => (
          <span
            key={mt.tagId}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: mt.tag.color || '#9370DB' }}
          >
            <span>🏷️ {mt.tag.name}</span>
          </span>
        ))}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1 rounded-full border border-gray-600 hover:border-purple-500 text-gray-400 hover:text-purple-400 text-xs transition-colors"
        >
          {existingTags.length === 0 ? '+ הוסף תגיות' : '+ עוד תגיות'}
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden">
          {/* Create new tag form */}
          <form onSubmit={handleCreateTag} className="p-3 border-b border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                placeholder="שם תגית חדשה"
                className="flex-1 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={isCreating || !newTagName.trim()}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-colors"
              >
                {isCreating ? '...' : '+'}
              </button>
            </div>

            {/* Color presets */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewTagColor(color)}
                  className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                    newTagColor === color ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </form>

          {/* Tags list */}
          <div className="max-h-40 overflow-y-auto">
            {allTags.length === 0 ? (
              <p className="text-gray-500 text-sm p-3">אין תגיות עדיין</p>
            ) : (
              allTags.map(tag => {
                const isAttached = attachedTagIds.has(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 transition-colors"
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center text-xs ${
                        isAttached ? 'text-white' : 'border border-gray-500'
                      }`}
                      style={isAttached ? { backgroundColor: tag.color || '#9370DB' } : {}}
                    >
                      {isAttached && '✓'}
                    </div>

                    {/* Tag color dot */}
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color || '#9370DB' }}
                    />

                    {/* Tag name */}
                    <span className="text-sm text-white">{tag.name}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-xs p-3 border-t border-gray-700">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
