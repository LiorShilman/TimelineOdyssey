import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useMomentStore } from '../stores/momentStoreNew';
import type { Moment } from '../types/api.types';
import Scene from '../components/3d/Scene';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function GalaxyPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { moments, isLoading, fetchMoments } = useMomentStore();
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    fetchMoments();
  }, []);

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
            <Scene moments={moments} onMomentClick={handleMomentClick} />
          </Canvas>
        )}
      </div>

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
        <div className="absolute top-0 left-0 bottom-0 w-96 bg-gray-900 bg-opacity-95 border-r border-gray-700 p-6 overflow-y-auto z-20">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-white">פרטי רגע</h2>
            <button
              onClick={handleCloseDetails}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {selectedMoment.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {format(new Date(selectedMoment.momentDate), 'PPP', { locale: he })}
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

      {/* Stats counter */}
      <div className="absolute top-20 right-4 bg-gray-900 bg-opacity-90 border border-gray-700 rounded-lg px-4 py-2">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{moments.length}</div>
          <div className="text-xs text-gray-400">רגעים</div>
        </div>
      </div>
    </div>
  );
}
