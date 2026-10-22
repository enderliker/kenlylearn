import Link from 'next/link';
import { 
  BookOpen, 
  UploadCloud, 
  FileCheck2, 
  Clock, 
  ArrowUpRight, 
  RotateCw, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const activeSubjects = [
    {
      id: 'ai-sys',
      name: 'Distributed Systems & AI Architectures',
      code: 'CS-441',
      materialsCount: 6,
      mastery: 84,
      lastReviewed: '2 hours ago',
      nextExam: 'Mock Exam #3 ready',
    },
    {
      id: 'mol-bio',
      name: 'Cellular & Molecular Genetics',
      code: 'BIO-210',
      materialsCount: 11,
      mastery: 68,
      lastReviewed: 'Yesterday',
      nextExam: '4 weak concepts flagged',
    },
    {
      id: 'econ-analysis',
      name: 'Microeconomic Analysis & Game Theory',
      code: 'ECON-302',
      materialsCount: 4,
      mastery: 92,
      lastReviewed: '3 days ago',
      nextExam: 'All concepts mastered',
    },
  ];

  const recallQueue = [
    {
      concept: 'Consensus Protocols (Raft vs. Paxos)',
      subject: 'Distributed Systems',
      dueLevel: 'High Priority',
      lastScore: '60%',
      estimatedMinutes: 6,
    },
    {
      concept: 'Transcription Factors & Enhancer Loops',
      subject: 'Molecular Genetics',
      dueLevel: 'Review Recommended',
      lastScore: '72%',
      estimatedMinutes: 8,
    },
    {
      concept: 'Nash Equilibrium in Repeated Games',
      subject: 'Microeconomic Analysis',
      dueLevel: 'Refresher',
      lastScore: '85%',
      estimatedMinutes: 5,
    },
  ];

  const recentAssessments = [
    {
      id: 'exam-1',
      title: 'Distributed Consensus & Fault Tolerance',
      subject: 'CS-441',
      score: 88,
      questionsCount: 15,
      completedAt: 'Yesterday at 16:30',
      status: 'Passed',
    },
    {
      id: 'exam-2',
      title: 'Gene Expression & PCR Diagnostics',
      subject: 'BIO-210',
      score: 64,
      questionsCount: 20,
      completedAt: '2 days ago',
      status: 'Needs Review',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Session Focus Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-zinc-900/40 border border-zinc-800">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-zinc-100">
            Active Study Session
          </h2>
          <p className="text-xs text-zinc-400">
            3 active courses • 21 indexed study resources • 3 recall concepts due today
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/upload">
            <Button variant="secondary" className="text-xs h-8 px-3 gap-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-zinc-400" />
              <span>Import Notes</span>
            </Button>
          </Link>
          <Link href="/exams">
            <Button variant="primary" className="text-xs h-8 px-3.5 gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Start Recall Session</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Study Grid: Recall Queue & Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Spaced Repetition Recall Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-zinc-200">Due for Active Recall</h3>
              <p className="text-xs text-zinc-400">Scheduled for spaced repetition to reinforce long-term memory</p>
            </div>
            <Link 
              href="/exams" 
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              <span>Practice all</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {recallQueue.map((item) => (
              <div
                key={item.concept}
                className="flex items-center justify-between p-3.5 rounded-lg bg-zinc-900/30 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
              >
                <div className="space-y-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-200 truncate">
                      {item.concept}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                      {item.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      {item.estimatedMinutes} min drill
                    </span>
                    <span>Last score: {item.lastScore}</span>
                  </div>
                </div>

                <Link href="/exams">
                  <Button variant="outline" className="text-xs h-7 px-2.5 gap-1.5 shrink-0">
                    <RotateCw className="w-3 h-3 text-zinc-400" />
                    <span>Review</span>
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Active Courses Section */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-zinc-200">Enrolled Courses</h3>
                <p className="text-xs text-zinc-400">Curated materials, structured outlines, and test banks</p>
              </div>
              <Link 
                href="/subjects" 
                className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeSubjects.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/subjects`}
                  className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="font-mono">{sub.code}</span>
                      <span>{sub.materialsCount} files</span>
                    </div>
                    <p className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors line-clamp-2">
                      {sub.name}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Mastery</span>
                      <span className="font-medium text-zinc-300">{sub.mastery}%</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-zinc-800 overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${sub.mastery}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Mock Exams & Activity */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-zinc-200">Recent Assessments</h3>
            <p className="text-xs text-zinc-400">Past performance and diagnosed knowledge gaps</p>
          </div>

          <div className="space-y-3">
            {recentAssessments.map((exam) => (
              <Card key={exam.id} className="p-4 space-y-3 bg-zinc-900/30 border-zinc-800/80">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {exam.subject} • {exam.questionsCount} questions
                    </span>
                    <CardTitle className="text-xs leading-snug mt-0.5">
                      {exam.title}
                    </CardTitle>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-sm font-semibold ${exam.score >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {exam.score}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    {exam.score >= 75 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>{exam.status}</span>
                  </div>
                  <span>{exam.completedAt}</span>
                </div>
              </Card>
            ))}

            {/* Quick Practice Prompt */}
            <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/60 space-y-3">
              <div className="flex items-center gap-2 text-zinc-300">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-medium">Create Custom Assessment</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Generate tailored multiple-choice, true/false, or open-ended synthesis exams from your uploaded course notes.
              </p>
              <Link href="/exams" className="block">
                <Button variant="secondary" className="w-full text-xs h-8">
                  Configure Practice Exam
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
