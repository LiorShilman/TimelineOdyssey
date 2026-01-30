import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { mediaService } from '../../services/mediaService';
import type { MediaFile } from '../../types/api.types';

interface MediaUploaderProps {
  momentId: string;
  onUploadComplete: (media: MediaFile[]) => void;
}

export default function MediaUploader({ momentId, onUploadComplete }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('אנא בחר קבצים להעלאה');
      return;
    }

    setUploading(true);
    try {
      const uploadedMedia = await mediaService.uploadMedia(momentId, selectedFiles);
      toast.success(`${uploadedMedia.length} קבצים הועלו בהצלחה!`);
      onUploadComplete(uploadedMedia);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'שגיאה בהעלאת קבצים');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">📸 העלאת מדיה</h3>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-4xl mb-2">📁</div>
        <p className="text-gray-300 mb-1">גרור קבצים לכאן או לחץ לבחירה</p>
        <p className="text-sm text-gray-500">תמונות ווידאו עד 100MB</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">קבצים נבחרים ({selectedFiles.length})</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-gray-700 rounded-lg p-3"
              >
                {file.type.startsWith('image/') ? (
                  <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                    🎬
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-400 hover:text-red-300 text-xl"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg transition-colors text-white font-medium"
          >
            {uploading ? 'מעלה...' : `העלה ${selectedFiles.length} קבצים`}
          </button>
        </div>
      )}
    </div>
  );
}
