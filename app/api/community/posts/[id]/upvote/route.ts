import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/app/lib/db';
import CommunityPost from '@/app/lib/models/CommunityPost';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    await connectDB();

    const post = await CommunityPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user already upvoted
    const hasUpvoted = post.upvotes.includes(session.user.id);

    if (hasUpvoted) {
      // Remove upvote
      post.upvotes = post.upvotes.filter((uid: any) => uid.toString() !== session.user.id);
      post.upvoteCount = Math.max(0, post.upvoteCount - 1);
    } else {
      // Add upvote
      post.upvotes.push(session.user.id);
      post.upvoteCount += 1;
    }

    await post.save();

    return NextResponse.json({ 
      upvotes: post.upvoteCount,
      hasUpvoted: !hasUpvoted 
    });
  } catch (error) {
    console.error('Error upvoting post:', error);
    return NextResponse.json(
      { error: 'Failed to upvote post' },
      { status: 500 }
    );
  }
}
