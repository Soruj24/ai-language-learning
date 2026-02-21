import { auth } from '@/app/lib/auth';
import connectDB from '@/app/lib/db';
import User from '@/app/lib/models/User';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { interfaceLanguage, languageLearning } = body;

    await connectDB();
    
    const updateData: any = {};
    if (interfaceLanguage) updateData.interfaceLanguage = interfaceLanguage;
    if (languageLearning) updateData.languageLearning = languageLearning;

    const user = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true }
    );

    return NextResponse.json(user);
  } catch (error) {
    console.error('[SETTINGS_UPDATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
