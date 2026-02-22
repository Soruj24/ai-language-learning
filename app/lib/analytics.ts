import { auth } from "@/app/lib/auth";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import Progress from "@/app/lib/models/Progress";
import { eachDayOfInterval, format, subDays } from "date-fns";

export async function getAnalyticsData() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  await connectDB();

  const user = await User.findById(session.user.id);
  if (!user) return null;

  // Fetch progress for the last 30 days
  const thirtyDaysAgo = subDays(new Date(), 30);
  const rawProgressData = await Progress.find({
    userId: session.user.id,
    $or: [
      { updatedAt: { $gte: thirtyDaysAgo } },
      { createdAt: { $gte: thirtyDaysAgo } }
    ]
  });

  // Sort by date ascending (oldest first) for charts
  const progressData = rawProgressData.sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt).getTime();
    const dateB = new Date(b.updatedAt || b.createdAt).getTime();
    return dateA - dateB;
  });

  // 1. Daily Study Time (Last 7 days)
  const today = new Date();
  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  });

  const dailyStudyTime = last7Days.map((date) => {
    const dayStr = format(date, "EEE"); // Mon, Tue, etc.
    const dateStr = format(date, "yyyy-MM-dd");
    
    // Find progress for this day
    const dayProgress = progressData.filter(p => {
      const pDate = p.updatedAt ? new Date(p.updatedAt) : new Date(p.createdAt);
      return format(pDate, "yyyy-MM-dd") === dateStr;
    });

    // Sum timeSpent (assuming it's in seconds, convert to minutes)
    const minutes = dayProgress.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0) / 60;
    
    return {
      day: dayStr,
      minutes: Math.round(minutes),
    };
  });

  // 2. Pronunciation & Grammar Progress (over the fetched period)
  // Group by week or just show last N sessions
  const pronunciationHistory = progressData
    .filter(p => p.pronunciationScore > 0)
    .map((p, index) => ({
      session: `Session ${index + 1}`,
      score: p.pronunciationScore,
    }))
    .slice(-10); // Last 10 sessions

  const grammarHistory = progressData
    .filter(p => p.grammarScore > 0)
    .map((p, index) => ({
      session: `Session ${index + 1}`,
      score: p.grammarScore,
    }))
    .slice(-10);

  // 3. Vocabulary Growth (Cumulative)
  // Assuming each completed lesson adds ~5 words on average
  let cumulativeWords = 0;
  const vocabularyGrowth = progressData
    .filter(p => p.completed)
    .map((p) => {
      cumulativeWords += 5; 
      return {
        week: format(p.updatedAt || p.createdAt, "MMM d"),
        words: cumulativeWords,
      };
    })
    .slice(-10); // Last 10 data points

  // If no progress data, show current words learned as a single point
  if (vocabularyGrowth.length === 0 && user.wordsLearned > 0) {
      vocabularyGrowth.push({
          week: format(new Date(), "MMM d"),
          words: user.wordsLearned
      });
  }

  // 4. Skills Breakdown (Average scores)
  const skills = [
    { subject: 'Vocabulary', A: 0, fullMark: 100 },
    { subject: 'Grammar', A: 0, fullMark: 100 },
    { subject: 'Pronunciation', A: 0, fullMark: 100 },
    { subject: 'Listening', A: 0, fullMark: 100 },
    { subject: 'Speaking', A: 0, fullMark: 100 },
    { subject: 'Reading', A: 0, fullMark: 100 },
  ];

  // Calculate averages from progress data
  const avgPronunciation = progressData.length > 0 
    ? progressData.reduce((acc, curr) => acc + (curr.pronunciationScore || 0), 0) / (progressData.filter(p => p.pronunciationScore).length || 1)
    : 0;
    
  const avgGrammar = progressData.length > 0
    ? progressData.reduce((acc, curr) => acc + (curr.grammarScore || 0), 0) / (progressData.filter(p => p.grammarScore).length || 1)
    : 0;

  // Scale other skills based on user stats
  // Assuming 500 words = 100% vocabulary mastery (for beginner level)
  const vocabScore = Math.min(100, Math.round((user.wordsLearned || 0) / 5)); 
  // Assuming 50 lessons = 100% for listening/reading (proxy metrics)
  const listeningScore = Math.min(100, Math.round((user.lessonsCompleted || 0) * 2)); 
  const readingScore = Math.min(100, Math.round((user.lessonsCompleted || 0) * 2.5)); 
  
  // Update skills array
  skills.find(s => s.subject === 'Pronunciation')!.A = Math.round(avgPronunciation) || (user.pronunciationScore || 0);
  skills.find(s => s.subject === 'Grammar')!.A = Math.round(avgGrammar) || (user.grammarAccuracy || 0);
  skills.find(s => s.subject === 'Speaking')!.A = Math.round(avgPronunciation) || (user.pronunciationScore || 0); // Proxy
  skills.find(s => s.subject === 'Vocabulary')!.A = vocabScore; 
  skills.find(s => s.subject === 'Listening')!.A = listeningScore; 
  skills.find(s => s.subject === 'Reading')!.A = readingScore; 

  // Achievements (User model)
  const userAchievements = user.achievements || [];
  
  const allAchievements = [
    { id: '1', name: 'First Steps', description: 'Complete your first lesson', icon: '🎯' },
    { id: '2', name: 'Week Warrior', description: '7 day streak', icon: '🔥' },
    { id: '3', name: 'Vocab Master', description: 'Learn 100 words', icon: '📚' },
    { id: '4', name: 'Scholar', description: 'Reach Intermediate level', icon: '🎓' },
    { id: '5', name: 'Perfect Pitch', description: 'Score 100% in pronunciation', icon: '🎤' },
    { id: '6', name: 'Social Butterfly', description: 'Complete 5 conversations', icon: '🦋' },
  ];

  const achievements = allAchievements.map(ach => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unlocked = userAchievements.find((ua: any) => ua.id === ach.id || ua.name === ach.name);
    return {
      ...ach,
      unlocked: !!unlocked,
      date: unlocked ? format(new Date(unlocked.date), "yyyy-MM-dd") : null
    };
  });

  // 5. Recent Activity
  const recentActivity = [...progressData] // Clone to avoid reversing the main array
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA; // Descending
    })
    .slice(0, 5)
    .map(p => ({
      lessonId: p.lessonId,
      score: p.score,
      date: p.updatedAt || p.createdAt,
      type: 'Lesson' // could be more specific if we had lesson details
    }));

  return {
    xp: user.xpPoints || 0,
    level: user.level || "Beginner",
    levelProgress: (user.xpPoints % 1000) / 10, // Simplified level progress
    streak: user.streak || 0,
    lessonsCompleted: user.lessonsCompleted || 0,
    wordsLearned: user.wordsLearned || 0,
    speakingTime: Math.round((user.speakingTime || 0)),
    pronunciationScore: Math.round(user.pronunciationScore || 0),
    grammarAccuracy: Math.round(user.grammarAccuracy || 0),
    dailyStudyTime,
    skills,
    vocabularyGrowth,
    pronunciationHistory,
    grammarHistory,
    achievements,
    recentActivity,
  };
}

export type AnalyticsData = Awaited<ReturnType<typeof getAnalyticsData>>;
