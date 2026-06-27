import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import compressImage from '../../utils/imageCompression';

interface FileUploadProps {
  id: string;
  label: string;
  acceptTypes: string[]; // e.g. ['image/jpeg', 'image/png', 'application/pdf']
  maxSizeInBytes: number;
  onFileSelect: (file: File | null) => void;
  value: File | null;
  hasError?: boolean;
}

export default function FileUpload({
  id,
  label,
  acceptTypes,
  maxSizeInBytes,
  onFileSelect,
  value,
  hasError = false,
}: FileUploadProps) {
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setOriginalSize(file.size);

    if (file.type === 'image/jpeg' || file.type === 'image/png') {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(file, maxSizeInBytes);
        onFileSelect(compressed);
      } catch (e) {
        onFileSelect(file);
      } finally {
        setIsCompressing(false);
      }
    } else {
      onFileSelect(file);
    }
  };

  const accept: Record<string, string[]> = {};
  acceptTypes.forEach((t) => {
    accept[t] = [];
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSizeInBytes,
    multiple: false,
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {value ? (
        <div className="flex items-center gap-4 p-3 border border-gray-200 rounded-xl bg-gray-50/50">
          {value.type.startsWith('image/') ? (
            <img
              src={URL.createObjectURL(value)}
              alt="Preview"
              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
              onLoad={(e) => URL.revokeObjectURL((e.target as any).src)}
            />
          ) : (
            <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center text-red-600">
              <span className="material-symbols-outlined text-2xl" data-icon="description">description</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-700 truncate">{value.name}</p>
            <p className="text-xs text-gray-500">
              {originalSize && originalSize !== value.size ? (
                <span>
                  Compressed:
                  {' '}
                  <strong className="text-gray-700">{formatSize(value.size)}</strong>
                  {' '}
                  (was
                  {' '}
                  {formatSize(originalSize)}
                  )
                </span>
              ) : (
                <span>
                  Size:
                  {formatSize(value.size)}
                </span>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              onFileSelect(null);
              setOriginalSize(null);
            }}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined text-xl" data-icon="delete">delete</span>
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2
            ${isDragActive ? 'border-blue-500 bg-blue-50/20' : 'border-gray-300 hover:border-gray-400'}
            ${hasError ? 'border-red-300 bg-red-50/10' : ''}
            ${isCompressing ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input id={id} {...getInputProps()} />
          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
            <span className="material-symbols-outlined text-2xl" data-icon="cloud_upload">cloud_upload</span>
          </div>
          {isCompressing ? (
            <div className="text-sm text-gray-500 animate-pulse font-medium">Compressing document...</div>
          ) : (
            <>
              <div className="text-sm text-gray-600">
                <span className="text-blue-600 font-semibold hover:underline">Click to upload</span>
                {' '}
                or drag and drop
              </div>
              <div className="text-xs text-gray-400">
                Max size:
                {' '}
                {formatSize(maxSizeInBytes)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
