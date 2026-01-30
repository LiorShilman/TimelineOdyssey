import { useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useMomentStore } from '../stores/momentStoreNew';
import type { Moment } from '../types/api.types';
import Scene from '../components/3d/Scene';
import MediaGallery from '../components/moments/MediaGallery';
import TimelineSlider from '../components/moments/TimelineSlider';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function GalaxyPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { moments, isLoading, fetchMoments } = useMomentStore();
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [filterStart, setFilterStart] = useState<Date | null>(null);
  const [filterEnd, setFilterEnd] = useState<Date | null>(null);

  useEffect(() => {
    fetchMoments();
  }, []);

  // Filter moments by date range
  const visibleMoments = useMemo(() => {
    if (!filterStart || !filterEnd) return moments;

    return moments.filter(m => {
      const date = new Date(m.momentDate);
      return date >= filterStart && date <= filterEnd;
    });
  }, [moments, filterStart, filterEnd]);

  const handleFilterChange = useCallback((start: Date | null, end: Date | null) => {
    setFilterStart(start);
    setFilterEnd(end);
  }, []);

  // Sort visible moments chronologically for navigation
  const sortedMoments = [...visibleMoments].sort(
    (a, b) => new Date(a.momentDate).getTime() - new Date(b.momentDate).getTime()
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleMomentClick = (moment: Moment) => {
    setSelectedMoment(moment);
  };

  const handleCloseDetails = () => {
    setSelectedMoment(null);
  };

  // Navigate to next moment in timeline
  const handleNextMoment = () => {
    if (!selectedMoment) {
      // If no moment selected, select the first one
      if (sortedMoments.length > 0) {
        setSelectedMoment(sortedMoments[0]);
      }
      return;
    }

    const currentIndex = sortedMoments.findIndex(m => m.id === selectedMoment.id);
    if (currentIndex !== -1 && currentIndex < sortedMoments.length - 1) {
      setSelectedMoment(sortedMoments[currentIndex + 1]);
    }
  };

  // Navigate to previous moment in timeline
  const handlePreviousMoment = () => {
    if (!selectedMoment) {
      // If no moment selected, select the last one
      if (sortedMoments.length > 0) {
        setSelectedMoment(sortedMoments[sortedMoments.length - 1]);
      }
      return;
    }

    const currentIndex = sortedMoments.findIndex(m => m.id === selectedMoment.id);
    if (currentIndex > 0) {
      setSelectedMoment(sortedMoments[currentIndex - 1]);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handlePreviousMoment(); // Right arrow = go back in time (RTL)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNextMoment(); // Left arrow = go forward in time (RTL)
      } else if (e.key === 'Escape') {
        handleCloseDetails();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMoment, sortedMoments]);

  return (
    <div className="h-screen w-screen bg-gray-900 overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-gray-900 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">🌌 Timeline Odyssey</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/moments')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white text-sm"
            >
              📋 תצוגת רשימה
            </button>
            <span className="text-gray-300">שלום, {user?.firstName || user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white text-sm"
            >
              התנתק
            </button>
          </div>
        </div>
      </header>

      {/* 3D Canvas */}
      <div className="h-full w-full">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mb-4"></div>
              <p className="text-white text-lg">טוען את הגלקסיה שלך...</p>
            </div>
          </div>
        ) : moments.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md px-4">
              <div className="text-6xl mb-4">🌟</div>
              <h2 className="text-2xl font-bold text-white mb-2">הגלקסיה שלך ריקה</h2>
              <p className="text-gray-400 mb-6">
                צור את הרגע הראשון שלך והתחל לבנות את ציר הזמן האישי שלך
              </p>
              <button
                onClick={() => navigate('/moments')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white font-medium"
              >
                צור רגע ראשון
              </button>
            </div>
          </div>
        ) : (
          <Canvas
            shadows
            gl={{ antialias: true, alpha: false }}
            className="cursor-grab active:cursor-grabbing"
          >
            <color attach="background" args={['#0a0a1e']} />
            <fog attach="fog" args={['#0a0a1e', 30, 80]} />
            <Scene
              moments={visibleMoments}
              onMomentClick={handleMomentClick}
              selectedMoment={selectedMoment}
            />
          </Canvas>
        )}
      </div>

      {/* Timeline Slider - hidden when moment is selected */}
      {!selectedMoment && (
        <TimelineSlider
          moments={moments}
          visibleMoments={visibleMoments}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Time Navigation Controls */}
      {moments.length > 0 && selectedMoment && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="flex items-center gap-4 bg-gray-900 bg-opacity-95 border border-gray-700 rounded-full px-6 py-3 shadow-2xl">
            {/* Previous Button */}
            <button
              onClick={handlePreviousMoment}
              disabled={sortedMoments.findIndex(m => m.id === selectedMoment.id) === 0}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full transition-colors text-white font-medium"
              title="רגע קודם (→)"
            >
              <span className="text-xl">→</span>
              <span>אחורה בזמן</span>
            </button>

            {/* Current position indicator */}
            <div className="px-4 py-2 bg-gray-800 rounded-full">
              <span className="text-purple-400 font-bold">
                {sortedMoments.findIndex(m => m.id === selectedMoment.id) + 1}
              </span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-gray-400">{sortedMoments.length}</span>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleCloseDetails}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors text-white font-medium"
              title="חזור לתצוגה כללית (ESC)"
            >
              <span>🌌</span>
              <span>תצוגה כללית</span>
            </button>

            {/* Next Button */}
            <button
              onClick={handleNextMoment}
              disabled={sortedMoments.findIndex(m => m.id === selectedMoment.id) === sortedMoments.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full transition-colors text-white font-medium"
              title="רגע הבא (←)"
            >
              <span>קדימה בזמן</span>
              <span className="text-xl">←</span>
            </button>
          </div>
        </div>
      )}

      {/* Controls hint */}
      {showControls && moments.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-90 border border-gray-700 rounded-lg p-4 max-w-xs">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-white font-semibold">🎮 בקרות</h3>
            <button
              onClick={() => setShowControls(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>🖱️ לחיצה וגרירה: סיבוב המצלמה</li>
            <li>🔍 גלגלת: זום פנימה/החוצה</li>
            <li>👆 לחיצה על בועה: פרטי רגע</li>
            <li>⌨️ Shift + גרירה: הזזת מצלמה</li>
            <li>⬅️ ➡️ חצים: ניווט בזמן</li>
            <li>⎋ ESC: סגור פרטים</li>
          </ul>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-90 border border-gray-700 rounded-lg p-4 max-w-xs">
        <h3 className="text-white font-semibold mb-3">📊 מקרא</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-300">😊 שמח</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-300">😢 עצוב</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-sm text-gray-300">🎉 מרגש</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-300">🌅 נוסטלגי</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-500"></div>
            <span className="text-sm text-gray-300">😐 נייטרלי</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-400">גודל הבועה = חשיבות הרגע</p>
          </div>
        </div>
      </div>

      {/* Moment Details Panel */}
      {selectedMoment && (
        <div className="absolute top-0 left-0 bottom-0 w-96 bg-gray-900 bg-opacity-95 border-r border-gray-700 p-6 overflow-y-auto z-20 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-white">פרטי רגע</h2>
            <button
              onClick={handleCloseDetails}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Navigation within panel */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={handlePreviousMoment}
              disabled={sortedMoments.findIndex(m => m.id === selectedMoment.id) === 0}
              className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white text-sm flex items-center justify-center gap-2"
            >
              <span>→</span>
              <span>קודם</span>
            </button>
            <div className="px-4 py-2 bg-purple-900 bg-opacity-50 rounded-lg flex items-center justify-center">
              <span className="text-purple-400 font-bold text-sm">
                {sortedMoments.findIndex(m => m.id === selectedMoment.id) + 1} / {sortedMoments.length}
              </span>
            </div>
            <button
              onClick={handleNextMoment}
              disabled={sortedMoments.findIndex(m => m.id === selectedMoment.id) === sortedMoments.length - 1}
              className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white text-sm flex items-center justify-center gap-2"
            >
              <span>הבא</span>
              <span>←</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {selectedMoment.title}
              </h3>
              <p className="text-gray-400 text-sm">
                📅 {format(new Date(selectedMoment.momentDate), 'PPP', { locale: he })}
              </p>
            </div>

            {selectedMoment.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-1">תיאור</h4>
                <p className="text-gray-400">{selectedMoment.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-1">רגש</h4>
                <p className="text-white capitalize">{selectedMoment.emotion}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-1">חשיבות</h4>
                <p className="text-yellow-400">
                  {'⭐'.repeat(selectedMoment.importance || 3)}
                </p>
              </div>
            </div>

            {/* Tags */}
            {selectedMoment.tags && selectedMoment.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">תגיות</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMoment.tags.map(mt => (
                    <span
                      key={mt.tagId}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: mt.tag.color || '#9370DB' }}
                    >
                      🏷️ {mt.tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Media Gallery */}
            {selectedMoment.mediaFiles && selectedMoment.mediaFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  קבצים מצורפים ({selectedMoment.mediaFiles.length})
                </h4>
                <MediaGallery media={selectedMoment.mediaFiles} editable={false} />
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={() => navigate('/moments')}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white text-sm"
              >
                ערוך רגע
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats counter and Reset button */}
      <div className="absolute top-20 right-4 space-y-3">
        <div className="bg-gray-900 bg-opacity-90 border border-gray-700 rounded-lg px-4 py-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{moments.length}</div>
            <div className="text-xs text-gray-400">רגעים</div>
          </div>
        </div>

        {/* Reset View Button */}
        {selectedMoment && (
          <button
            onClick={handleCloseDetails}
            className="w-full bg-gray-900 bg-opacity-90 border border-gray-700 hover:border-purple-500 rounded-lg px-4 py-2 transition-colors group"
            title="חזור לתצוגה כללית (ESC)"
          >
            <div className="text-center">
              <div className="text-2xl group-hover:scale-110 transition-transform">🌌</div>
              <div className="text-xs text-gray-400 group-hover:text-purple-400 transition-colors">
                תצוגה כללית
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
