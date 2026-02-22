import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/app/lib/db';
import User from '@/app/lib/models/User';
import { formatDistanceToNow } from 'date-fns';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // In a real app, you might check if the user is a teacher.
    // const teacher = await User.findById(session.user.id);
    // if (teacher.role !== 'teacher') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // For now, let's just fetch all students.
    const students = await User.find({ role: 'student' }).select('name email languageLearning xpPoints lastActive');

    // Transform to match the UI's expectation roughly, or update UI to match this.
    // UI expects: { id, name, progress, lastActive, language }
    const formattedStudents = students.map(student => {
      let lastActiveStr = 'Recently';
      if (student.lastActive) {
        try {
          lastActiveStr = formatDistanceToNow(new Date(student.lastActive), { addSuffix: true });
        } catch (e) {
          console.error("Error formatting date", e);
        }
      }
      return {
        id: student._id,
        name: student.name,
        email: student.email,
        progress: Math.min(100, Math.floor((student.xpPoints || 0) / 100)), // Mock progress calculation
        lastActive: lastActiveStr,
        language: student.languageLearning || 'English',
      };
    });

    return NextResponse.json({ students: formattedStudents });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
