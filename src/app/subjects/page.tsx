import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SubjectsPage() {
  const sampleSubjects = [
    {
      name: 'Artificial Intelligence',
      count: 0,
      description: 'Machine learning fundamentals, LLM architectures, neural networks, and prompt engineering.',
      color: '#6366f1',
    },
    {
      name: 'World History',
      count: 0,
      description: 'Industrial revolutions, global conflicts, treaties, and modern geopolitical history.',
      color: '#f59e0b',
    },
    {
      name: 'Cellular Biology',
      count: 0,
      description: 'Cell anatomy, mitosis/meiosis, DNA transcription, and cellular respiration mechanisms.',
      color: '#10b981',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Subjects</h2>
          <p className="text-xs text-zinc-400">
            Organize materials, exams, and generated summaries by academic domain
          </p>
        </div>
        <Button variant="secondary" className="gap-2">
          <Plus className="w-3.5 h-3.5" />
          Add Subject
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sampleSubjects.map((sub) => (
          <Card
            key={sub.name}
            className="hover:border-zinc-700 transition-colors cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
              <Badge variant="outline">{sub.count} materials</Badge>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm">{sub.name}</h3>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                {sub.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
