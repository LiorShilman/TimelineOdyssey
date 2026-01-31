import { useState } from 'react';
import type { MediaFile } from '../../types/api.types';

interface MediaGalleryProps {
  media: MediaFile[];
  onDelete?: (mediaId: string) => void;
  editable?: boolean;
}

export default function MediaGallery({ media, onDelete, editable = false }: MediaGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (media.length === 0) {
    return null;
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3">
        {media.map((item) => (
          <div key={item.id} className="relative group">
            {item.fileType === 'image' ? (
              <div
                className="aspect-square rounded-lg overflow-hidden cursor-pointer bg-gray-700"
                onClick={() => setSelectedImage(item.url)}
              >
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.fileName}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            ) : item.fileType === 'video' ? (
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-700 relative">
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  controls
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black bg-opacity-30">
                  <span className="text-4xl">▶️</span>
                </div>
              </div>
            ) : null}

            {/* Delete Button */}
            {editable && onDelete && (
              <button
                onClick={() => onDelete(item.id)}
                className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
          >
            ×
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
