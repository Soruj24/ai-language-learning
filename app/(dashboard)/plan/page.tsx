
import LearningPlanClient from '@/app/components/dashboard/LearningPlan';

export const metadata = {
  title: 'Learning Plan | LinguaAI',
  description: 'Your 30-day personalized roadmap',
};

export default function LearningPlanPage() {
  return (
    <div className="container py-8">
      <LearningPlanClient />
    </div>
  );
}
