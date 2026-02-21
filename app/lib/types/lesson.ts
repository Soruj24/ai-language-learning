export interface VocabularyItem {
  word: string;
  translation: string;
  example: string;
  pronunciation?: string;
}

export interface GrammarRule {
  rule: string;
  explanation: string;
  example: string;
}

export interface Example {
  scenario: string;
  dialogue: string[];
}

export interface Exercise {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface QuizItem {
  question: string;
  answer: string;
  options?: string[]; // Added options for multiple choice quiz
}

export interface LessonPlan {
  title: string;
  level: string; // Added level
  topic: string; // Added topic
  introduction: string;
  vocabulary: VocabularyItem[];
  grammar_rules: GrammarRule[];
  examples: Example[];
  exercises: Exercise[];
  quiz: QuizItem[];
}
