import { UploadForm } from '@/components/upload/upload-form';
import { Card } from '@/components/ui/card';
import { FileText, Image as ImageIcon, FileCode, Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Study Materials — KenlyLearn',
  description: 'Upload textbooks, lecture notes, and papers for automated structuring and mock exam synthesis',
};

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">Upload Study Materials</h2>
        <p className="text-xs text-zinc-400">
          Import lecture notes, textbooks, slides, and academic papers to generate concept outlines and active recall assessments.
        </p>
      </div>

      {/* Upload Zone & Form */}
      <UploadForm />

      {/* Format Specifications & Privacy Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-3 p-5 bg-zinc-900/30 border-zinc-800/80">
          <h3 className="text-xs font-semibold text-zinc-200">Supported Formats</h3>
          <div className="space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
              <span><strong>PDF Documents:</strong> Textbooks, syllabus outlines, and research papers with preserved headings.</span>
            </div>
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>Image Captures:</strong> Whiteboard diagrams, blackboard formulas, and handwritten notes via OCR.</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Plain Text & Markdown:</strong> Course summaries, lecture transcripts, and markdown files.</span>
            </div>
          </div>
        </Card>

        <Card className="space-y-3 p-5 bg-zinc-900/30 border-zinc-800/80">
          <div className="flex items-center gap-2 text-zinc-200">
            <Shield className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-semibold">Private & Ephemeral Processing</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            All text extractions are processed securely on serverless workers. Your personal documents are isolated strictly to your account and never shared with other tenants or used for external model training.
          </p>
        </Card>
      </div>
    </div>
  );
}
