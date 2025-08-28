export enum GameState {
  HOME = 'HOME',
  LEVEL_SELECTION = 'LEVEL_SELECTION',
  QUIZ = 'QUIZ',
  STATS = 'STATS',
  RANDOM_QUIZ_SETUP = 'RANDOM_QUIZ_SETUP',
  LEVEL_QUIZ_SETUP = 'LEVEL_QUIZ_SETUP',
  CUSTOM_QUIZ_SETUP = 'CUSTOM_QUIZ_SETUP',
}

export type Difficulty = 'سهل' | 'متوسط' | 'صعب';

export interface Level {
  id: number;
  title: string;
  difficulty: Difficulty;
  description: string;
}

export interface Question {
  id: string; // Unique identifier for drag-and-drop and state management
  question: string;
  options: string[];
  correctAnswer: string;
  time?: number; // Time in seconds for this specific question
}

export interface Stats {
  correct: number;
  incorrect: number;
  total: number;
  wrongQuestions: { question: Question; selectedAnswer: string }[];
}

export interface RandomQuizSettings {
  count: number;
  difficulty: Difficulty;
  timePerQuestion: number; // Kept for random quiz simplicity, as it has no editor
}

export interface CustomQuizSettings {
  title: string;
  questions: Question[]; // Each question can have its own time
}