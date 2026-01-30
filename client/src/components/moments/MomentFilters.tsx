import { useState } from 'react';
import type { GetMomentsParams } from '../../types/api.types';

interface MomentFiltersProps {
  onFilterChange: (filters: GetMomentsParams) => void;
  onClearFilters: () => void;
}

export default function MomentFilters({ onFilterChange, onClearFilters }: MomentFiltersProps) {
  const [filters, setFilters] = useState<GetMomentsParams>({});
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (newFilters: Partial<GetMomentsParams>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleClear = () => {
    setFilters({});
    onClearFilters();
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) => filters[key as keyof GetMomentsParams] !== undefined
  );

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">🔍 סינון</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-purple-600 text-xs rounded-full">פעיל</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            {isOpen ? 'הסתר' : 'הצג'}
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="text-sm text-gray-400 hover:text-white"
            >
              נקה
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Emotion Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">רגש</label>
            <select
              value={filters.emotion || ''}
              onChange={(e) =>
                handleFilterChange({
                  emotion: e.target.value || undefined,
                })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">הכל</option>
              <option value="happy">😊 שמח</option>
              <option value="sad">😢 עצוב</option>
              <option value="exciting">🎉 מרגש</option>
              <option value="nostalgic">🌅 נוסטלגי</option>
              <option value="neutral">😐 נייטרלי</option>
            </select>
          </div>

          {/* Importance Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">
              חשיבות {filters.importance ? `(${filters.importance})` : ''}
            </label>
            <select
              value={filters.importance || ''}
              onChange={(e) =>
                handleFilterChange({
                  importance: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">הכל</option>
              <option value="5">⭐⭐⭐⭐⭐ (5)</option>
              <option value="4">⭐⭐⭐⭐ (4)</option>
              <option value="3">⭐⭐⭐ (3)</option>
              <option value="2">⭐⭐ (2)</option>
              <option value="1">⭐ (1)</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium mb-2">טווח תאריכים</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) =>
                  handleFilterChange({
                    startDate: e.target.value || undefined,
                  })
                }
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder="מ-"
              />
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) =>
                  handleFilterChange({
                    endDate: e.target.value || undefined,
                  })
                }
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder="עד-"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
