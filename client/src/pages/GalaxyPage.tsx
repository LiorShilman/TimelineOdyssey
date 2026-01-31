import { useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useMomentStore } from '../stores/momentStoreNew';
import type { Moment } from '../types/api.types';
import Scene from '../components/3d/Scene';
import MediaGallery from '../components/moments/MediaGallery';
import TimelineSlider from '../components/moments/TimelineSlider';
import RelationManager from '../components/moments/RelationManager';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function GalaxyPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { moments, isLoading, fetchMoments, updateMoment, createMoment } = useMomentStore();
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [viewMode, setViewMode] = useState<'galaxy' | 'relations'>('galaxy');
  const [showControls, setShowControls] = useState(true);
  const [filterStart, setFilterStart] = useState<Date | null>(null);
  const [filterEnd, setFilterEnd] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quickCreateForm, setQuickCreateForm] = useState({ title: '', momentDate: '', emotion: 'neutral' });

  useEffect(() => {
    fetchMoments();
  }, []);

  // Filter moments by date range + search
  const visibleMoments = useMemo(() => {
    let filtered = moments;

    if (filterStart && filterEnd) {
      filtered = filtered.filter(m => {
        const date = new Date(m.momentDate);
        return date >= filterStart && date <= filterEnd;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(q) ||
        (m.description || '').toLowerCase().includes(q) ||
        (m.tags || []).some(mt => mt.tag.name.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [moments, filterStart, filterEnd, searchQuery]);

  const handleFilterChange = useCallback((start: Date | null, end: Date | null) => {
    setFilterStart(start);
    setFilterEnd(end);
  }, []);

  // Sort visible moments chronologically for navigation
  const sortedMoments = [...visibleMoments].sort(
    (a, b) => new Date(a.momentDate).getTime() - new Date(b.momentDate).getTime()
  );

  // Collect unique tags across all moments for filter pills
  const uniqueTags = useMemo(() => {
    const seen = new Map<string, string>();
    moments.forEach(m => {
      (m.tags || []).forEach(mt => {
        if (!seen.has(mt.tag.name)) seen.set(mt.tag.name, mt.tag.color || '#9370DB');
      });
    });
    return Array.from(seen.entries()).map(([name, color]) => ({ name, color }));
  }, [moments]);

  // IDs of moments that should be dimmed (emotion/tag filter active but moment doesn't match)
  const dimmedIds = useMemo(() => {
    if (selectedEmotions.size === 0 && selectedTags.size === 0) return null;
    const dimmed = new Set<string>();
    visibleMoments.forEach(m => {
      const emotionMatch = selectedEmotions.size === 0 || selectedEmotions.has(m.emotion || 'neutral');
      const tagMatch = selectedTags.size === 0 || (m.tags || []).some(mt => selectedTags.has(mt.tag.name));
      if (!emotionMatch || !tagMatch) dimmed.add(m.id);
    });
    return dimmed;
  }, [visibleMoments, selectedEmotions, selectedTags]);

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => {
      const next = new Set(prev);
      next.has(emotion) ? next.delete(emotion) : next.add(emotion);
      return next;
    });
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      next.has(tagName) ? next.delete(tagName) : next.add(tagName);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedEmotions(new Set());
    setSelectedTags(new Set());
  };

  const openCreateModal = () => {
    setQuickCreateForm({ title: '', momentDate: new Date().toISOString().slice(0, 16), emotion: 'neutral' });
    setShowCreateModal(true);
  };

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMoment({
        title: quickCreateForm.title,
        momentDate: new Date(quickCreateForm.momentDate).toISOString(),
        emotion: quickCreateForm.emotion as 'happy' | 'sad' | 'exciting' | 'nostalgic' | 'neutral',
      });
      setShowCreateModal(false);
    } catch {}
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleMomentClick = (moment: Moment) => {
    setSelectedMoment(moment);
  };

  const handleCloseDetails = () => {
    setSelectedMoment(null);
    setViewMode('galaxy');
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
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
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
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש רגעים..."
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-52"
              dir="rtl"
            />
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

      {/* Emotion & tag filter pills */}
      {!selectedMoment && (
        <div className="absolute top-16 left-0 right-0 z-10 px-4 py-2 flex items-center gap-2 flex-wrap">
          {[
            { key: 'happy', label: '😊 שמח', active: 'bg-yellow-500 text-white' },
            { key: 'sad', label: '😢 עצוב', active: 'bg-blue-500 text-white' },
            { key: 'exciting', label: '🎉 מרגש', active: 'bg-orange-500 text-white' },
            { key: 'nostalgic', label: '🌅 נוסטלגי', active: 'bg-purple-500 text-white' },
            { key: 'neutral', label: '😐 נייטרלי', active: 'bg-gray-500 text-white' },
          ].map(({ key, label, active }) => (
            <button
              key={key}
              onClick={() => toggleEmotion(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedEmotions.has(key) ? active : 'bg-gray-800 bg-opacity-80 text-gray-300 hover:bg-gray-700 border border-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
          {uniqueTags.map(tag => (
            <button
              key={tag.name}
              onClick={() => toggleTag(tag.name)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedTags.has(tag.name) ? 'text-white shadow-lg' : 'bg-gray-800 bg-opacity-80 text-gray-300 hover:bg-gray-700 border border-gray-600'
              }`}
              style={selectedTags.has(tag.name) ? { backgroundColor: tag.color } : {}}
            >
              🏷️ {tag.name}
            </button>
          ))}
          {(selectedEmotions.size > 0 || selectedTags.size > 0) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1 rounded-full text-xs text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 transition-colors"
            >
              ✕ נקה
            </button>
          )}
        </div>
      )}

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
              viewMode={viewMode}
              dimmedIds={dimmedIds}
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
            <h2 className="text-2xl font-bold text-white">רגע פרטי</h2>
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

            {/* Flag toggle */}
            <button
              type="button"
              onClick={async () => {
                await updateMoment(selectedMoment.id, { flagged: !selectedMoment.flagged });
                await fetchMoments();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                selectedMoment.flagged
                  ? 'bg-yellow-900 bg-opacity-40 border border-yellow-600 hover:bg-opacity-60'
                  : 'bg-gray-800 border border-gray-600 hover:border-yellow-600 hover:bg-gray-700'
              }`}
            >
              <span className="text-lg">{selectedMoment.flagged ? '🏴' : '🚩'}</span>
              <span className={`text-sm font-medium ${selectedMoment.flagged ? 'text-yellow-400' : 'text-gray-300'}`}>
                {selectedMoment.flagged ? 'רגע מוגדר' : 'הגדר רגע'}
              </span>
            </button>

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

            {/* Relations */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">קשרים בין אירועים</h4>
              <RelationManager
                momentId={selectedMoment.id}
                existingRelations={selectedMoment.relations || []}
                allMoments={moments}
                onRelationsChange={fetchMoments}
              />
            </div>

            {/* Relations view toggle */}
            {(selectedMoment.relations?.length ?? 0) > 0 && (
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'relations' ? 'galaxy' : 'relations')}
                className={`w-full px-4 py-2 rounded-lg text-sm transition-colors ${
                  viewMode === 'relations'
                    ? 'bg-purple-700 hover:bg-purple-800 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-purple-500 text-gray-300 hover:text-purple-400'
                }`}
              >
                {viewMode === 'relations' ? 'חזור לגלקסיה ✕' : 'תצוגת הקשרים 🔗'}
              </button>
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

      {/* FAB — create moment from galaxy */}
      {!selectedMoment && (
        <button
          onClick={openCreateModal}
          className="absolute bottom-64 right-4 z-20 w-14 h-14 bg-purple-600 hover:bg-purple-500 rounded-full shadow-lg shadow-purple-900 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          title="צור רגע חדש"
        >
          <span className="text-white text-2xl leading-none">+</span>
        </button>
      )}

      {/* Quick-create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-white">צור רגע חדש</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleQuickCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">כותרת *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={quickCreateForm.title}
                    onChange={(e) => setQuickCreateForm({ ...quickCreateForm, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="הכותרת של הרגע..."
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">תאריך ושעה *</label>
                  <input
                    type="datetime-local"
                    required
                    value={quickCreateForm.momentDate}
                    onChange={(e) => setQuickCreateForm({ ...quickCreateForm, momentDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">רגש</label>
                  <select
                    value={quickCreateForm.emotion}
                    onChange={(e) => setQuickCreateForm({ ...quickCreateForm, emotion: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="happy">😊 שמח</option>
                    <option value="sad">😢 עצוב</option>
                    <option value="exciting">🎉 מרגש</option>
                    <option value="nostalgic">🌅 נוסטלגי</option>
                    <option value="neutral">😐 נייטרלי</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white text-sm"
                  >
                    ביטול
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white text-sm font-medium"
                  >
                    צור רגע
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stats counter and Reset button */}
      <div className="absolute top-24 right-4 space-y-3">
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
