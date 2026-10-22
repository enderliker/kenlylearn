import Link from 'next/link';
import { UploadCloud, FileCheck2, Sparkles, BookOpen, Clock, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personal Study Workspace</span>
          </div>
          <Badge variant="indigo">Nemotron-3 Ultra 550B</Badge>
        </div>
        
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-zinc-100">
            Welcome to your intelligent learning platform
          </h2>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Upload textbooks, lecture notes, diagrams, or papers. Nemotron-3 synthesizes rigorous study summaries, step-by-step Feynman explanations, and multi-format mock exams for active recall.
          </p>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Link href="/upload">
            <Button variant="primary" className="gap-2">
              <UploadCloud className="w-4 h-4" />
              Upload New Material
            </Button>
          </Link>
          <Link href="/exams">
            <Button variant="secondary" className="gap-2">
              <FileCheck2 className="w-4 h-4" />
              View Practice Exams
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-medium">Active Subjects</span>
            <BookOpen className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-2xl font-semibold text-zinc-100">3</p>
          <p className="text-[11px] text-zinc-500">AI, World History, Cellular Biology</p>
        </Card>

        <Card className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-medium">Processed Materials</span>
            <Clock className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-2xl font-semibold text-zinc-100">0</p>
          <p className="text-[11px] text-zinc-500">Ready for instant summary extraction</p>
        </Card>

        <Card className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-medium">Exams Taken</span>
            <Target className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-2xl font-semibold text-zinc-100">0</p>
          <p className="text-[11px] text-zinc-500">All submissions & feedback permanently stored</p>
        </Card>
      </div>

      {/* Quick Access Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Study Topics</CardTitle>
            <CardDescription>
              Your subject areas ready for review and generation
            </CardDescription>
          </CardHeader>
          <div className="space-y-2 pt-2">
            {[
              { name: 'Artificial Intelligence', materials: 0, tag: 'Machine Learning' },
              { name: 'World History', materials: 0, tag: 'Modern Era' },
              { name: 'Cellular Biology', materials: 0, tag: 'Genetics' },
            ].map((sub) => (
              <div
                key={sub.name}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs hover:border-zinc-700 transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="font-medium text-zinc-200">{sub.name}</p>
                  <p className="text-[11px] text-zinc-500">{sub.materials} materials loaded</p>
                </div>
                <Badge variant="outline">{sub.tag}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Study Modes</CardTitle>
            <CardDescription>
              Pedagogical features inspired by Astra AI
            </CardDescription>
          </CardHeader>
          <div className="space-y-2 pt-2 text-xs">
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 space-y-1">
              <span className="font-medium text-indigo-400">1. Structured Executive Summaries</span>
              <p className="text-zinc-400">Distills high-volume material into core principles and high-retention bullet points.</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 space-y-1">
              <span className="font-medium text-indigo-400">2. Adaptive Concept Explanations</span>
              <p className="text-zinc-400">Choose between simple, balanced, or detailed technical breakdowns with real-world analogies.</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 space-y-1">
              <span className="font-medium text-indigo-400">3. Multi-Format Mock Exams</span>
              <p className="text-zinc-400">MCQs, True/False, Fill-in-the-blank, and open-ended essay questions evaluated by AI reasoning.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
