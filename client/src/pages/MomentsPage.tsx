import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useMomentStore } from '../stores/momentStoreNew';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import type { Moment, GetMomentsParams } from '../types/api.types';
import EditMomentModal from '../components/moments/EditMomentModal';
import MomentFilters from '../components/moments/MomentFilters';
import MomentStats from '../components/moments/MomentStats';

const EMOTION_COLORS = {
  happy: 'bg-yellow-500',
  sad: 'bg-blue-500',
  exciting: 'bg-orange-500',
  nostalgic: 'bg-purple-500',
  neutral: 'bg-gray-500',
};

const EMOTION_LABELS = {
  happy: 'שמח',
  sad: 'עצוב',
  exciting: 'מרגש',
  nostalgic: 'נוסטלגי',
  neutral: 'נייטרלי',
};

export default function MomentsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { moments, isLoading, fetchMoments, deleteMoment } = useMomentStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMoment, setEditingMoment] = useState<Moment | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    momentDate: '',
    emotion: 'neutral' as any,
    importance: 3,
  });

  useEffect(() => {
    fetchMoments();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreateMoment = async (e: React.FormEvent) => {
    e.preventDefault();
    const { createMoment } = useMomentStore.getState();
    try {
      await createMoment({
        ...formData,
        momentDate: new Date(formData.momentDate).toISOString(),
      });
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        momentDate: '',
        emotion: 'neutral',
        importance: 3,
      });
    } catch (error) {
      // Error handled by store
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('בטוח שברצונך למחוק את הרגע?')) {
      await deleteMoment(id);
    }
  };

  const handleFilterChange = (filters: GetMomentsParams) => {
    fetchMoments(filters);
  };

  const handleClearFilters = () => {
    fetchMoments();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🌌 Timeline Odyssey</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">שלום, {user?.firstName || user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              התנתק
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">הרגעים שלי</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
          >
            {showCreateForm ? 'ביטול' : '+ רגע חדש'}
          </button>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <MomentFilters
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">יצירת רגע חדש</h3>
            <form onSubmit={handleCreateMoment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">כותרת *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="הכותרת של הרגע..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">תיאור</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="תאר את הרגע..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">תאריך *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.momentDate}
                    onChange={(e) => setFormData({ ...formData, momentDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">רגש</label>
                  <select
                    value={formData.emotion}
                    onChange={(e) => setFormData({ ...formData, emotion: e.target.value as any })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="happy">😊 שמח</option>
                    <option value="sad">😢 עצוב</option>
                    <option value="exciting">🎉 מרגש</option>
                    <option value="nostalgic">🌅 נוסטלגי</option>
                    <option value="neutral">😐 נייטרלי</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">חשיבות ({formData.importance})</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.importance}
                    onChange={(e) => setFormData({ ...formData, importance: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  שמור
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Content Grid: Stats + Moments */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stats Sidebar */}
          <div className="lg:col-span-1">
            <MomentStats />
          </div>

          {/* Moments List */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                <p className="mt-4 text-gray-400">טוען רגעים...</p>
              </div>
            ) : moments.length === 0 ? (
              <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-lg">עדיין אין רגעים. צור את הרגע הראשון שלך!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {moments.map((moment) => (
                  <div
                    key={moment.id}
                    className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {moment.emotion && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                EMOTION_COLORS[moment.emotion]
                              }`}
                            >
                              {EMOTION_LABELS[moment.emotion]}
                            </span>
                          )}
                          <span className="text-gray-400 text-sm">
                            {format(new Date(moment.momentDate), 'PPP', { locale: he })}
                          </span>
                          <span className="text-yellow-400">{'⭐'.repeat(moment.importance || 3)}</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{moment.title}</h3>
                        {moment.description && <p className="text-gray-300">{moment.description}</p>}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setEditingMoment(moment)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                        >
                          ערוך
                        </button>
                        <button
                          onClick={() => handleDelete(moment.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
                        >
                          מחק
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {editingMoment && (
          <EditMomentModal
            moment={editingMoment}
            onClose={() => setEditingMoment(null)}
          />
        )}
      </main>
    </div>
  );
}
