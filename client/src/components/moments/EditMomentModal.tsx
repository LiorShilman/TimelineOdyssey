import { useState, useEffect } from 'react';
import { useMomentStore } from '../../stores/momentStoreNew';
import type { Moment, MediaFile } from '../../types/api.types';
import MediaUploader from './MediaUploader';
import MediaGallery from './MediaGallery';
import { mediaService } from '../../services/mediaService';
import { toast } from 'sonner';

interface EditMomentModalProps {
  moment: Moment;
  onClose: () => void;
}

export default function EditMomentModal({ moment, onClose }: EditMomentModalProps) {
  const { updateMoment, isLoading } = useMomentStore();
  const [formData, setFormData] = useState({
    title: moment.title,
    description: moment.description || '',
    momentDate: moment.momentDate.slice(0, 16), // Format for datetime-local
    emotion: moment.emotion || 'neutral',
    importance: moment.importance || 3,
  });
  const [media, setMedia] = useState<MediaFile[]>(moment.mediaFiles || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMoment(moment.id, {
        ...formData,
        momentDate: new Date(formData.momentDate).toISOString(),
      });
      onClose();
    } catch (error) {
      // Error handled by store
    }
  };

  const handleMediaUploadComplete = (newMedia: MediaFile[]) => {
    setMedia((prev) => [...prev, ...newMedia]);
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('בטוח שברצונך למחוק את הקובץ?')) return;

    try {
      await mediaService.deleteMedia(mediaId);
      setMedia((prev) => prev.filter((m) => m.id !== mediaId));
      toast.success('הקובץ נמחק בהצלחה');
    } catch (error: any) {
      toast.error('שגיאה במחיקת הקובץ');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">עריכת רגע</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                rows={4}
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
                <label className="block text-sm font-medium mb-1">
                  חשיבות ({formData.importance})
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.importance}
                  onChange={(e) =>
                    setFormData({ ...formData, importance: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </div>

            {/* Media Gallery */}
            {media.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">מדיה ({media.length})</label>
                <MediaGallery
                  media={media}
                  onDelete={handleDeleteMedia}
                  editable
                />
              </div>
            )}

            {/* Media Uploader */}
            <MediaUploader
              momentId={moment.id}
              onUploadComplete={handleMediaUploadComplete}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                disabled={isLoading}
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg transition-colors"
              >
                {isLoading ? 'שומר...' : 'שמור שינויים'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
