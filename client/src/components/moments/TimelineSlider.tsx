import { useState, useCallback, useMemo } from 'react';
import type { Moment } from '../../types/api.types';

interface TimelineSliderProps {
  moments: Moment[];
  visibleMoments: Moment[];
  onFilterChange: (start: Date | null, end: Date | null) => void;
}

export default function TimelineSlider({ moments, visibleMoments, onFilterChange }: TimelineSliderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterActive, setFilterActive] = useState(false);

  // Calculate min and max dates from all moments
  const { minDate, maxDate, yearGroups } = useMemo(() => {
    if (moments.length === 0) {
      return { minDate: new Date(), maxDate: new Date(), yearGroups: {} };
    }

    const dates = moments.map(m => new Date(m.momentDate).getTime());
    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));

    // Group moments by year
    const groups: Record<string, Moment[]> = {};
    moments.forEach(m => {
      const year = new Date(m.momentDate).getFullYear().toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(m);
    });

    return { minDate: min, maxDate: max, yearGroups: groups };
  }, [moments]);

  const sortedYears = Object.keys(yearGroups).sort((a, b) => Number(a) - Number(b));

  // Filter by year
  const handleFilterYear = useCallback((year: string) => {
    const start = new Date(Number(year), 0, 1);
    const end = new Date(Number(year), 11, 31, 23, 59, 59);
    setFilterActive(true);
    onFilterChange(start, end);
  }, [onFilterChange]);

  // Clear filter
  const handleClearFilter = useCallback(() => {
    setFilterActive(false);
    onFilterChange(null, null);
  }, [onFilterChange]);

  if (moments.length === 0) return null;

  return (
    <div className="absolute bottom-20 left-0 right-0 z-40 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Toggle button */}
        <div className="flex justify-center mb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 bg-opacity-90 border border-gray-700 hover:border-purple-500 rounded-full text-sm text-gray-300 hover:text-white transition-colors"
          >
            <span>📅</span>
            <span>ציר הזמן</span>
            {filterActive && (
              <span className="ml-2 px-2 py-0.5 bg-purple-600 rounded-full text-xs text-white">פעיל</span>
            )}
            <span className="text-xs text-gray-500">{isExpanded ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Timeline panel */}
        {isExpanded && (
          <div className="bg-gray-900 bg-opacity-95 border border-gray-700 rounded-xl p-4 shadow-2xl">
            {/* Year buttons */}
            <div className="flex flex-wrap gap-2 justify-center items-center">
              {/* Clear filter */}
              {filterActive && (
                <button
                  onClick={handleClearFilter}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-full text-xs text-white transition-colors"
                >
                  ✕ נקה סינון
                </button>
              )}

              {sortedYears.map(year => {
                const count = yearGroups[year].length;
                const isFiltered = filterActive && visibleMoments.length > 0 &&
                  visibleMoments.some(m => new Date(m.momentDate).getFullYear().toString() === year);
                const isCurrentYear = year === new Date().getFullYear().toString();

                return (
                  <button
                    key={year}
                    onClick={() => handleFilterYear(year)}
                    className={`relative px-4 py-2 rounded-full text-sm transition-all ${
                      isFiltered
                        ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                        : isCurrentYear
                          ? 'bg-gray-700 border border-purple-500 text-purple-400 hover:bg-purple-900'
                          : 'bg-gray-800 border border-gray-600 text-gray-300 hover:border-purple-500 hover:text-white'
                    }`}
                  >
                    <span className="font-semibold">{year}</span>
                    <span className={`absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                      isFiltered ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Visual timeline bar */}
            <div className="mt-4 relative">
              <div className="h-1 bg-gray-700 rounded-full">
                <div className="h-full bg-gradient-to-l from-purple-500 via-pink-500 to-purple-600 rounded-full" />
              </div>

              {/* Year markers */}
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-500">{sortedYears[0]}</span>
                <span className="text-xs text-gray-500">{sortedYears[sortedYears.length - 1]}</span>
              </div>

              {/* Moment dots on the bar */}
              <div className="absolute top-0 left-0 right-0 h-1 flex items-center">
                {moments
                  .sort((a, b) => new Date(a.momentDate).getTime() - new Date(b.momentDate).getTime())
                  .map((moment, index) => {
                    const total = moments.length;
                    const position = total > 1 ? (index / (total - 1)) * 100 : 50;
                    const isVisible = !filterActive || visibleMoments.some(m => m.id === moment.id);

                    return (
                      <div
                        key={moment.id}
                        className={`absolute w-2.5 h-2.5 rounded-full -translate-y-1/2 transform -translate-x-1/2 transition-opacity ${
                          isVisible ? 'opacity-100' : 'opacity-20'
                        }`}
                        style={{
                          left: `${position}%`,
                          backgroundColor: getEmotionColor(moment.emotion)
                        }}
                      />
                    );
                  })}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-3 flex justify-center">
              <span className="text-xs text-gray-500">
                {filterActive
                  ? `מוצגים ${visibleMoments.length} מתוך ${moments.length} רגעים`
                  : `סה"כ ${moments.length} רגעים`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getEmotionColor(emotion: string | null): string {
  const colors: Record<string, string> = {
    happy: '#FFD700',
    sad: '#4169E1',
    exciting: '#FF6347',
    nostalgic: '#9370DB',
    neutral: '#A9A9A9',
  };
  return colors[emotion || 'neutral'] || '#A9A9A9';
}
