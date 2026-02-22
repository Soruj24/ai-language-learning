import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/app/lib/db';
import CommunityPost from '@/app/lib/models/CommunityPost';
import User from '@/app/lib/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = parseInt(url.searchParams.get('skip') || '0');

    const query: any = {};
    if (type) {
      query.type = type;
    }

    // Optional: Filter by language if user has a preference
    // const user = await User.findById(session.user.id);
    // if (user?.learningLanguage) {
    //   query.language = user.learningLanguage;
    // }

    const posts = await CommunityPost.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      type, 
      content, 
      title, 
      category, 
      originalText, 
      correctedText, 
      explanation,
      resourceType,
      link
    } = body;

    if (!type) {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(session.user.id);

    const newPost = new CommunityPost({
      author: session.user.id,
      authorName: user?.name || 'Anonymous',
      type,
      content,
      title,
      category: category || 'General',
      language: user?.learningLanguage || 'English',
      
      // Conditional fields based on type
      ...(type === 'correction' && { originalText, correctedText, explanation }),
      ...(type === 'resource' && { resourceType, link }),
      ...(type === 'group' && { memberCount: 1, members: [session.user.id] }), // Creator is first member
    });

    await newPost.save();

    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (error) {
    console.error('Error creating community post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
