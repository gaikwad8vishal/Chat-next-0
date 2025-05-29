import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'User not authenticated' },
        { status: 401 }
      );
    }


    const groups = [
      { id: 'group1', name: 'Family Group' },
      { id: 'group2', name: 'Work Team' },
    ];

    return NextResponse.json(groups, { status: 200 });
  } catch (error) {
    console.error('Fetch groups error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}