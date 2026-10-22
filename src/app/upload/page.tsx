import { UploadCloud, FileText, Image as ImageIcon, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">Upload Study Materials</h2>
        <p className="text-xs text-zinc-400">
          Import lecture notes, textbooks, slides, and academic papers to generate concept outlines and active recall assessments.
        </p>
      </div>

      <div className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 transition-colors rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4 bg-zinc-950/60">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-zinc-200">
            Drag and drop study files here, or click to browse
          </p>
          <p className="text-xs text-zinc-500 max-w-sm">
            Supported formats: Textbooks & slides (PDF), whiteboard/notes captures (JPG, PNG via OCR), and plain text documents (TXT, MD).
          </p>
        </div>
        <div className="flex items-center gap-4 pt-1 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> PDF</span>
          <span className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> PNG / JPG</span>
          <span className="flex items-center gap-1.5"><File className="w-3.5 h-3.5" /> TXT / Markdown</span>
        </div>
        <Button variant="secondary" size="sm" className="mt-2">
          Select Files from Device
        </Button>
      </div>

      <Card className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-200">Supported Ingestion Pipeline</h3>
        <ul className="text-xs text-zinc-400 space-y-2 list-disc list-inside leading-relaxed">
          <li>Digital textbooks and lecture decks retain headings, formulas, and structural context.</li>
          <li>Handwritten whiteboards or paper notes undergo high-resolution optical character recognition.</li>
          <li>All uploaded documents are isolated to your private account workspace.</li>
        </ul>
      </Card>
    </div>
  );
}
