import { db } from './index';
import { subjects } from './schema';
import crypto from 'crypto';

async function seed() {
  console.log('🌱 Seeding database with initial subjects...');

  const initialSubjects = [
    {
      id: crypto.randomUUID(),
      name: 'Artificial Intelligence',
      description: 'Core concepts in Machine Learning, LLMs, neural networks, and prompt engineering',
      color: '#6366f1',
      icon: 'brain',
    },
    {
      id: crypto.randomUUID(),
      name: 'World History',
      description: 'Industrial revolution, world wars, and contemporary global developments',
      color: '#f59e0b',
      icon: 'landmark',
    },
    {
      id: crypto.randomUUID(),
      name: 'Cellular Biology',
      description: 'Cell structure, DNA transcription, respiration, and cellular division',
      color: '#10b981',
      icon: 'dna',
    },
  ];

  for (const s of initialSubjects) {
    db.insert(subjects).values(s).onConflictDoNothing().run();
  }

  console.log('✅ Initial subjects seeded successfully.');
}

seed().catch((err) => {
  console.error('❌ Database seed error:', err);
  process.exit(1);
});
