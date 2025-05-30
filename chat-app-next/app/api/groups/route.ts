import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from  '@/app/api/auth/[...nextauth]/route' // Adjust the import path as needed

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    console.log('Fetched groups:', groups);
    return NextResponse.json(groups);
  } catch (error) {
    console.error('Groups fetch error:', error);
    return NextResponse.json({ message: 'Server error fetching groups' }, { status: 500 });
  }
}