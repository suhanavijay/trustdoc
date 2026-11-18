import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { formatBytes } from '../utils/crypto';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  selectedFile?: File | null;
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  accept = '.pdf',
  label = 'Upload Official PDF Document',
  selectedFile = null,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    if (accept === '.pdf' && !file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return false;
    }
    return true;
  };

  const handleClickZone = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        onClick={handleClickZone}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer select-none ${
          disabled
            ? 'opacity-60 cursor-not-allowed border-slate-800 bg-slate-900/30'
            : isDragging
            ? 'border-emerald-400 bg-emerald-950/30 scale-[1.01] shadow-xl shadow-emerald-500/10'
            : selectedFile
            ? 'border-emerald-500/60 bg-slate-900/80 hover:border-emerald-400'
            : 'border-slate-700 hover:border-emerald-500/60 bg-slate-900/40 hover:bg-slate-900/70'
        }`}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FileText className="w-8 h-8" />
              </div>
              <div className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-semibold text-slate-100 max-w-md truncate px-2 text-base">
                {selectedFile.name}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <span>{formatBytes(selectedFile.size)}</span>
                <span>•</span>
                <span className="font-mono text-emerald-400">PDF Document</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClickZone();
                }}
                disabled={disabled}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change file
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors">
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-200">
                {label}
              </p>
              <p className="text-sm text-slate-400">
                Drag and drop your PDF here, or <span className="text-emerald-400 font-medium hover:underline">browse files</span>
              </p>
            </div>

            <p className="text-xs text-slate-500">
              Only authentic PDF documents supported (up to 50MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
