
import FlashcardClient from '@/app/components/dashboard/FlashcardClient';

export const metadata = {
  title: 'Flashcards | LinguaAI',
  description: 'Review your vocabulary with spaced repetition',
};

export default function FlashcardsPage() {
  return (
    <div className="container py-8">
      <FlashcardClient />
    </div>
  );
}
