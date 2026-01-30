import { useEffect } from 'react';
import { useMomentStore } from '../../stores/momentStoreNew';

const EMOTION_LABELS = {
  happy: '😊 שמח',
  sad: '😢 עצוב',
  exciting: '🎉 מרגש',
  nostalgic: '🌅 נוסטלגי',
  neutral: '😐 נייטרלי',
};

export default function MomentStats() {
  const { stats, fetchStats, isLoading } = useMomentStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const totalMoments = stats.total;
  const hasEmotions = Object.keys(stats.byEmotion).length > 0;
  const hasImportance = Object.keys(stats.byImportance).length > 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">📊 סטטיסטיקה</h3>

      {/* Total Moments */}
      <div className="mb-6">
        <div className="text-3xl font-bold text-purple-400">{totalMoments}</div>
        <div className="text-sm text-gray-400">סך הכל רגעים</div>
      </div>

      {/* Emotion Distribution */}
      {hasEmotions && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3 text-gray-300">לפי רגש</h4>
          <div className="space-y-2">
            {Object.entries(stats.byEmotion)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([emotion, count]) => {
                const percentage = totalMoments > 0 ? ((count as number) / totalMoments) * 100 : 0;
                return (
                  <div key={emotion} className="flex items-center gap-2">
                    <div className="text-sm w-24">
                      {EMOTION_LABELS[emotion as keyof typeof EMOTION_LABELS] || emotion}
                    </div>
                    <div className="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-400 w-12 text-right">{count}</div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Importance Distribution */}
      {hasImportance && (
        <div>
          <h4 className="text-sm font-medium mb-3 text-gray-300">לפי חשיבות</h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((level) => {
              const count = stats.byImportance[level] || 0;
              const percentage = totalMoments > 0 ? (count / totalMoments) * 100 : 0;
              return (
                <div key={level} className="flex items-center gap-2">
                  <div className="text-sm w-24">
                    {'⭐'.repeat(level)} ({level})
                  </div>
                  <div className="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-400 w-12 text-right">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!hasEmotions && !hasImportance && totalMoments === 0 && (
        <div className="text-center text-gray-500 py-4">
          אין עדיין רגעים להצגה
        </div>
      )}
    </div>
  );
}
