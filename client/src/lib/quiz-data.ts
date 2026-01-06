export type QuestionType = 'multiple-choice' | 'true-false' | 'text';

export interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | boolean;
  explanation: string;
}

export const quizQuestions: Question[] = [
  {
    id: 1,
    type: 'true-false',
    question: 'AI (Artificial Intelligence) can only exist in physical robots.',
    correctAnswer: false,
    explanation: 'AI is software that can run on computers, servers, and phones. It does not need a physical robot body.'
  },
  {
    id: 2,
    type: 'multiple-choice',
    question: 'Which of these is a common use of AI today?',
    options: [
      'Time travel calculations',
      'Face recognition on phones',
      'Teleportation devices',
      'Reading human minds'
    ],
    correctAnswer: 'Face recognition on phones',
    explanation: 'AI is widely used for facial recognition, voice assistants, and recommendation systems.'
  },
  {
    id: 3,
    type: 'multiple-choice',
    question: 'What does "Machine Learning" mean?',
    options: [
      'Machines teaching humans',
      'Computers learning from data without being explicitly programmed',
      'Robots going to school',
      'Fixing broken machines'
    ],
    correctAnswer: 'Computers learning from data without being explicitly programmed',
    explanation: 'Machine Learning is a subset of AI where computers learn patterns from data to make decisions.'
  },
  {
    id: 4,
    type: 'true-false',
    question: 'Generative AI (like ChatGPT) can create new content like text and images.',
    correctAnswer: true,
    explanation: 'Yes! Generative AI can create new content based on patterns it has learned from existing data.'
  },
  {
    id: 5,
    type: 'text',
    question: 'In one word, what is the most important thing for AI to learn from?',
    correctAnswer: 'Data',
    explanation: 'Data is the fuel for AI. Without data, AI models cannot learn patterns or make predictions.'
  }
];

export const familiarityLevels = [
  { value: 1, label: 'Newbie', description: 'I know nothing about AI.' },
  { value: 2, label: 'Beginner', description: 'I have heard of AI but don\'t use it.' },
  { value: 3, label: 'User', description: 'I use AI tools sometimes.' },
  { value: 4, label: 'Enthusiast', description: 'I follow AI news and use it often.' },
  { value: 5, label: 'Expert', description: 'I build or work with AI professionally.' }
];
