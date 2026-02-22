import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/app/lib/db';
import Assignment from '@/app/lib/models/Assignment';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId, topic, description } = await req.json();

    if (!studentId || !topic) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const assignment = await Assignment.create({
      teacher: session.user.id,
      student: studentId,
      topic,
      description,
      status: 'assigned',
    });

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
