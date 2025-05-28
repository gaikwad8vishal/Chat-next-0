import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const groupId = searchParams.get('groupId');

  try {
    if (userId) {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId },
            { recipientId: userId },
          ],
        },
        include: { sender: true },
        orderBy: { createdAt: 'asc' },
      });
      return NextResponse.json(messages);
    } else if (groupId) {
      const messages = await prisma.message.findMany({
        where: { groupId },
        include: { sender: true },
        orderBy: { createdAt: 'asc' },
      });
      return NextResponse.json(messages);
    }
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { content, senderId, recipientId, groupId } = await request.json();

    if (!content || (!recipientId && !groupId)) {
      return NextResponse.json({ message: 'Content and recipient or group ID required' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        recipientId,
        groupId,
      },
      include: { sender: true },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}