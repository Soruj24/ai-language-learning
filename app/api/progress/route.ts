import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import connectDB from '@/app/lib/db';
import Progress from '@/app/lib/models/Progress';
import User from '@/app/lib/models/User';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    console.log('Received progress sync:', data);
    
    const { lessonId, score, completed, timeSpent, pronunciationScore, grammarScore } = data;

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
    }

    await connectDB();

    // Validate IDs
    const userId = session.user.id;
    // Check if lessonId is a valid ObjectId, if not, use a fallback or create a new ID if it's a string based ID
    // Assuming lessonId from client might be a string ID from a generated lesson
    // If it's a generated lesson, it might not exist in the Lesson collection yet.
    // We will trust the ID provided for now or generate a new ObjectId if it's not valid.
    
    const validLessonId = mongoose.Types.ObjectId.isValid(lessonId) 
      ? lessonId 
      : new mongoose.Types.ObjectId(); // Caution: This might not link to a real lesson if lessonId was meant to be persistent

    // Update or create Progress record
    const progress = await Progress.findOneAndUpdate(
      { userId, lessonId: validLessonId },
      {
        $set: {
          score: score || 0,
          completed: completed || false,
          pronunciationScore: pronunciationScore || 0,
          grammarScore: grammarScore || 0,
          timeSpent: timeSpent || 0,
          completedAt: new Date(),
        }
      },
      { upsert: true, new: true }
    );

    // Update User stats
    const user = await User.findById(userId);
    if (user) {
      // Logic to update user stats (xp, streak, etc.)
      // Note: This logic should ideally be centralized or atomic
      if (score) {
        user.xpPoints = (user.xpPoints || 0) + score;
      }
      
      if (completed) {
        user.lessonsCompleted = (user.lessonsCompleted || 0) + 1;
      }

      // Simple streak logic
      const lastActive = user.lastActive ? new Date(user.lastActive) : null;
      const today = new Date();
      
      if (lastActive) {
        const diffTime = Math.abs(today.getTime() - lastActive.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays === 1) {
            // Consecutive day
            user.streak = (user.streak || 0) + 1;
        } else if (diffDays > 1) {
            // Broken streak
            user.streak = 1;
        }
        // If diffDays is 0 (same day), streak doesn't increase but doesn't reset
      } else {
        user.streak = 1;
      }
      
      user.lastActive = today;
      await user.save();
    }

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error('Progress sync error:', error);
    return NextResponse.json({ error: 'Failed to sync progress' }, { status: 500 });
  }
}
