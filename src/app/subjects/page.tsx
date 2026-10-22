import { Plus, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SubjectsPage() {
  const sampleSubjects = [
    {
      code: 'CS-441',
      name: 'Distributed Systems & AI Architectures',
      materialsCount: 6,
      examsCount: 3,
      description: 'Consensus protocols, Byzantine fault tolerance, neural runtime scaling, and model serving.',
    },
    {
      code: 'HIST-105',
      name: 'Modern Geopolitics & Institutional History',
      materialsCount: 8,
      examsCount: 2,
      description: 'Industrial revolutions, monetary treaties, diplomatic alliances, and postwar international order.',
    },
    {
      code: 'BIO-210',
      name: 'Cellular & Molecular Genetics',
      materialsCount: 11,
      examsCount: 4,
      description: 'Transcription regulation, chromatin remodeling, CRISPR mechanisms, and enzyme kinetics.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">Academic Subjects</h2>
          <p className="text-xs text-zinc-400">
            Course structures, reference materials, and targeted test banks
          </p>
        </div>
        <Button variant="secondary" className="text-xs h-8 px-3 gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          <span>New Subject</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sampleSubjects.map((sub) => (
          <Card
            key={sub.code}
            className="p-5 space-y-3 bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="font-mono text-indigo-400 font-medium">{sub.code}</span>
                <span>{sub.materialsCount} resources</span>
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 leading-snug">
                {sub.name}
              </h3>
              <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                {sub.description}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
              <span className="text-[11px] text-zinc-400">{sub.examsCount} mock exams</span>
              <Link 
                href="/exams"
                className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 font-medium"
              >
                <span>Study</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
