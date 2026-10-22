'use client';

import * as React from 'react';
import { 
  UploadCloud, 
  CheckCircle2, 
  Loader2, 
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

interface SubjectOption {
  id: string;
  name: string;
  color?: string;
}

interface UploadedMaterialResult {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  tokenEstimate: number;
  pageCount?: number;
  wordCount: number;
  createdAt: string;
}

export function UploadForm() {
  const [dragActive, setDragActive] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [subjects, setSubjects] = React.useState<SubjectOption[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string>('');
  const [customTitle, setCustomTitle] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<UploadedMaterialResult | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    // Attempt to load subjects if available
    async function loadSubjects() {
      try {
        const res = await fetch('/api/subjects');
        if (res.ok) {
          const data = await res.json();
          if (data.subjects) setSubjects(data.subjects);
        }
      } catch {
        // Silently continue if subjects API isn't populated
      }
    }
    loadSubjects();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    setError(null);
    setResult(null);

    // Validate size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError(`File size (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum 10MB limit.`);
      return;
    }

    setFile(selectedFile);
    if (!customTitle) {
      // Set default title to clean filename without extension
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '');
      setCustomTitle(cleanName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (customTitle.trim()) {
        formData.append('title', customTitle.trim());
      }
      if (selectedSubjectId) {
        formData.append('subjectId', selectedSubjectId);
      }

      const res = await fetch('/api/materials', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload material');
      }

      setResult(data.material);
      setFile(null);
      setCustomTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      {result && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-semibold">Document Processed & Indexed</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              ~{result.tokenEstimate.toLocaleString()} tokens
            </span>
          </div>

          <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800 space-y-1">
            <p className="text-xs font-medium text-zinc-200">{result.title}</p>
            <p className="text-[11px] text-zinc-500 font-mono">
              {result.fileName} • {result.wordCount} words {result.pageCount ? `• ${result.pageCount} pages` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link href="/exams">
              <Button variant="primary" size="sm" className="text-xs h-7 gap-1">
                <span>Generate Mock Exam</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => setResult(null)}
            >
              Upload Another
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-indigo-500 bg-indigo-950/10'
              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 mb-3">
            <UploadCloud className="w-5 h-5" />
          </div>

          {file ? (
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-200">{file.name}</p>
              <p className="text-[11px] text-zinc-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB • Click to replace
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-200">
                Click to browse or drag and drop study files
              </p>
              <p className="text-[11px] text-zinc-500 max-w-sm">
                PDF textbooks, notes captures (PNG, JPG), Markdown, or Plain Text up to 10MB
              </p>
            </div>
          )}
        </div>

        {/* Optional Metadata Row */}
        {file && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="space-y-1">
              <label htmlFor="material-title-input" className="text-[11px] font-medium text-zinc-400">
                Document Title
              </label>
              <input
                id="material-title-input"
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Distributed Consensus Chapter 4"
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="material-subject-select" className="text-[11px] font-medium text-zinc-400">
                Assign to Course / Subject (Optional)
              </label>
              <select
                id="material-subject-select"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
              >
                <option value="">Unassigned (General Library)</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Action Button */}
        {file && (
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full text-xs h-9"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                Extracting & Indexing Material...
              </>
            ) : (
              'Process & Index Document'
            )}
          </Button>
        )}
      </form>
    </div>
  );
}
