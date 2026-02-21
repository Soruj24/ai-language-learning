'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/app/lib/i18n/LanguageContext';

const lessons = [
  { id: 1, title: 'Introduction to Spanish', description: 'Learn basic greetings and introductions.', level: 'Beginner' },
  { id: 2, title: 'Ordering Food', description: 'Vocabulary and phrases for restaurants.', level: 'Beginner' },
  { id: 3, title: 'Travel Essentials', description: 'Asking for directions and booking hotels.', level: 'Intermediate' },
  { id: 4, title: 'Business Communication', description: 'Professional emails and meetings.', level: 'Advanced' },
];

export default function LessonClient() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('lessons')}</h1>
        <p className="text-muted-foreground">{t('chooseLesson')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{lesson.title}</CardTitle>
              <div className="text-sm text-muted-foreground">{lesson.level}</div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-4">
              <p className="text-sm text-muted-foreground">{lesson.description}</p>
              <Link href={`/lesson/${lesson.id}`}>
                <Button className="w-full">{t('startLesson')}</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
