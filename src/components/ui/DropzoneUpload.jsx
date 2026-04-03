import { useRef, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';

const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const DropzoneUpload = ({
  label,
  accept = 'image/*,application/pdf',
  maxSizeMb = 5,
  onUploaded,
  previewUrl,
  onClear,
}) => {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Max file size is ${maxSizeMb}MB`);
      return;
    }
    const typeOk = /image\/(jpeg|jpg|png|webp)|application\/pdf/.test(file.type);
    if (!typeOk) {
      setError('Only jpg/png/webp/pdf files are allowed');
      return;
    }

    setUploading(true);
    setProgress(20);
    const dataUrl = await toDataUrl(file);
    setProgress(100);
    onUploaded?.({
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      dataUrl,
      uploadedAt: new Date().toISOString(),
    });
    setTimeout(() => {
      setUploading(false);
      setProgress(0);
    }, 300);
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-sm text-zinc-200 font-medium">{label}</p>}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-xl border border-orange-500/30 bg-[#141414] p-4 text-center orange-hover"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <UploadCloud className="mx-auto mb-2 text-orange-400" size={18} />
        <p className="text-xs text-zinc-300">Drag and drop or click to upload</p>
        <p className="text-[11px] text-zinc-500 mt-1">jpg/png/webp up to 5MB, pdf up to 10MB</p>
      </div>
      {uploading && (
        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600" style={{ width: `${progress}%` }} />
        </div>
      )}
      {previewUrl && (
        <div className="relative rounded-xl border border-orange-500/20 bg-[#101010] p-2">
          {previewUrl.startsWith('data:image') ? (
            <img src={previewUrl} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />
          ) : (
            <p className="text-xs text-zinc-300 truncate">{previewUrl}</p>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear?.();
            }}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white"
          >
            <X size={12} />
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};
