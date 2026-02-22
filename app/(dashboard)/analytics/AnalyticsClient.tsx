'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Flame, Zap, Book, Target, Sparkles, Calendar } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, AreaChart, Area,
} from 'recharts';
import { useLanguage } from '@/app/lib/i18n/LanguageContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-medium mb-1">{label}</p>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface AnalyticsClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialStats: any;
}

export default function AnalyticsClient({ initialStats }: AnalyticsClientProps) {
  const { learningLanguage } = useLanguage();
  const [stats] = useState(initialStats);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background via-background to-secondary/10">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
          <div className="h-6 w-32 bg-muted rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold">No analytics data available yet.</h2>
        <p className="text-muted-foreground mt-2">Start your first lesson to see your progress!</p>
        <Button className="mt-4" onClick={() => window.location.href = '/lesson/new'}>Start Learning</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your progress in {learningLanguage}</p>
        </div>
        <Button className="gap-2">
          <Sparkles className="w-4 h-4" />
          Get AI Insights
        </Button>
      </div>

      {/* Top Widgets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streak} Days</div>
            <p className="text-xs text-muted-foreground">
              +2 days from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.xp} XP</div>
            <p className="text-xs text-muted-foreground">
              Top 5% of learners
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.level}</div>
            <Progress value={stats.levelProgress} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.levelProgress}% to Advanced
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Words Learned</CardTitle>
            <Book className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.wordsLearned}</div>
            <p className="text-xs text-muted-foreground">
              +45 new words this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Area */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skill Breakdown</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Daily Study Time Chart */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Daily Study Time</CardTitle>
                <CardDescription>Minutes spent learning over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.dailyStudyTime}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="day" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `${value}m`} 
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--muted)/0.2)'}} />
                      <Bar 
                        dataKey="minutes" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]} 
                        name="Study Time"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Vocabulary Growth Chart */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Vocabulary Growth</CardTitle>
                <CardDescription>Cumulative words learned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.vocabularyGrowth}>
                      <defs>
                        <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="week" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="words" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#colorWords)" 
                        name="Total Words"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Pronunciation Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Pronunciation Progress</CardTitle>
                <CardDescription>Average score per session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.pronunciationHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="session" hide />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#8b5cf6" 
                        strokeWidth={2} 
                        dot={{ r: 4, fill: "#8b5cf6" }}
                        name="Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between items-center mt-4 text-sm">
                   <span className="text-muted-foreground">Current Average</span>
                   <span className="font-bold text-lg text-purple-600">{stats.pronunciationScore}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Grammar Accuracy */}
            <Card>
              <CardHeader>
                <CardTitle>Grammar Accuracy</CardTitle>
                <CardDescription>Accuracy trend over sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.grammarHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="session" hide />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#10b981" 
                        strokeWidth={2} 
                        dot={{ r: 4, fill: "#10b981" }}
                        name="Accuracy"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between items-center mt-4 text-sm">
                   <span className="text-muted-foreground">Current Accuracy</span>
                   <span className="font-bold text-lg text-emerald-600">{stats.grammarAccuracy}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
              <CardDescription>Latest milestones unlocked</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {stats.achievements.filter((a: any) => a.unlocked).map((achievement: any) => (
                    <div key={achievement.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border">
                      <div className="text-2xl bg-background p-2 rounded-full shadow-sm">
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{achievement.name}</h4>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {achievement.date}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skill Proficiency Radar</CardTitle>
              <CardDescription>Visual breakdown of your language capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.skills}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="My Skills"
                      dataKey="A"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.4}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
           <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
             {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
             {stats.achievements.map((achievement: any) => (
               <Card key={achievement.id} className={!achievement.unlocked ? "opacity-60 grayscale" : ""}>
                 <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
                   <div className="text-4xl mb-2">{achievement.icon}</div>
                   <h3 className="font-semibold">{achievement.name}</h3>
                   <p className="text-xs text-muted-foreground">{achievement.description}</p>
                   {achievement.unlocked ? (
                     <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                       Unlocked
                     </Badge>
                   ) : (
                     <Badge variant="outline" className="mt-2">
                       Locked
                     </Badge>
                   )}
                 </CardContent>
               </Card>
             ))}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
