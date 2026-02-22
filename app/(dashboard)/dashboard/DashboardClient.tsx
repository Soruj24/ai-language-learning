'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useLanguage } from "@/app/lib/i18n/LanguageContext";
import { Video, BookOpen, Clock, Calendar } from "lucide-react";
import type { AnalyticsData } from "@/app/lib/analytics";
import { formatDistanceToNow } from "date-fns";

interface DashboardClientProps {
  userName: string;
  stats?: AnalyticsData | null;
}

export default function DashboardClient({ userName, stats }: DashboardClientProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");

  const handleJoinSession = () => {
    if (sessionId.trim()) {
      router.push(`/live-session/${sessionId}`);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    return `${(minutes / 60).toFixed(1)}h`;
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('welcomeBack')}, {userName}!</h1>
        <p className="text-muted-foreground">{t('overviewProgress')}</p>
      </div>

      {/* Join Live Session Card */}
      <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-200 dark:border-indigo-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-500" />
            Join Live Session
          </CardTitle>
          <CardDescription>Enter a session ID provided by your teacher to join a live class.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 max-w-md">
            <Input 
              placeholder="Session ID (e.g. 123-abc)" 
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            />
            <Button onClick={handleJoinSession}>Join</Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalLessons')}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.lessonsCompleted || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('lessonsCompleted')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('wordsLearned')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.wordsLearned || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('keepLearning')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('practiceTime')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats?.speakingTime || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {t('totalPracticeTime')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('currentStreak')}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.streak || 0} Days</div>
            <p className="text-xs text-muted-foreground">
              {t('keepItUp')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t('recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="font-medium">Lesson Practice</span>
                      <span className="text-xs text-muted-foreground">
                        {activity.date ? formatDistanceToNow(new Date(activity.date), { addSuffix: true }) : 'Recently'}
                      </span>
                    </div>
                    <div className="font-bold text-primary">
                      {activity.score}% Score
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('noRecentActivity')}</p>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('recommendedLessons')}</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               <div className="p-4 rounded-lg bg-muted/50 border">
                 <h4 className="font-semibold mb-1">Conversational {stats?.level || 'Beginner'}</h4>
                 <p className="text-sm text-muted-foreground mb-3">Improve your speaking skills with daily scenarios.</p>
                 <Button variant="outline" size="sm" onClick={() => router.push('/lesson/new')}>Start Lesson</Button>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
