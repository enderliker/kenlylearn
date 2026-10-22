import { FileCheck2, Sparkles, CheckCircle, HelpCircle, Edit3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ExamsPage() {
  const questionTypes = [
    {
      title: 'Multiple Choice (MCQ)',
      description: '4 structured options testing accurate recall and differentiation of similar terms.',
      icon: CheckCircle,
      tag: 'Objective',
    },
    {
      title: 'True / False',
      description: 'Rapid factual checks on definitions, principles, and common misconceptions.',
      icon: HelpCircle,
      tag: 'Rapid',
    },
    {
      title: 'Open-Ended Synthesis',
      description: 'Answer in your own words. Nemotron evaluates reasoning depth with AI feedback.',
      icon: Edit3,
      tag: 'Deep Reasoning',
    },
    {
      title: 'Fill-in-the-Blank',
      description: 'Key vocabulary, formula variables, or technical terms missing inline.',
      icon: Sparkles,
      tag: 'Recall',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Mock Exams</h2>
          <p className="text-xs text-zinc-400">
            Active recall tests with automated AI grading and feedback
          </p>
        </div>
      </div>

      <div className="p-8 rounded-xl bg-zinc-900/30 border border-zinc-800/80 text-center space-y-3">
        <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-indigo-400">
          <FileCheck2 className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-200">No Exams Generated Yet</h3>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          Upload any study material first. Once uploaded, you can generate customized practice exams with a single click.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Supported Question Formats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questionTypes.map((q) => {
            const Icon = q.icon;
            return (
              <Card key={q.title} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-zinc-200">{q.title}</span>
                  </div>
                  <Badge variant="outline">{q.tag}</Badge>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {q.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
