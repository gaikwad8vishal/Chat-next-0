import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth'; // Import NextAuth.js session handler

export async function GET() {
  try {
    // Fetch the logged-in user's session using NextAuth.js
    const session = await getServerSession();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'User not authenticated' },
        { status: 401 }
      );
    }

    const loggedInUserId = session.user.id;

    // Fetch all users except the logged-in user
    const users = await prisma.user.findMany({
      where: {
        id: { not: loggedInUserId },
      },
      select: {
        id: true,
        username: true,
        profilePicture: true,
        messagesSent: {
          where: { recipientId: loggedInUserId },
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { content: true, createdAt: true, senderId: true },
        },
        messagesReceived: {
          where: { senderId: loggedInUserId },
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { content: true, createdAt: true, senderId: true },
        },
        _count: {
          select: {
            messagesReceived: {
              where: { senderId: loggedInUserId, read: false },
            },
          },
        },
      },
    });

    // Process users to format the response
    const contacts = users.map((user) => {
      // Determine the last message (most recent between sent and received)
      const sentMessage = user.messagesSent[0];
      const receivedMessage = user.messagesReceived[0];
      let lastMessage = null;
      let lastMessageTime = null;
      let lastMessageSentByUser = false;

      if (sentMessage && receivedMessage) {
        if (sentMessage.createdAt > receivedMessage.createdAt) {
          lastMessage = sentMessage.content;
          lastMessageTime = sentMessage.createdAt;
          lastMessageSentByUser = true;
        } else {
          lastMessage = receivedMessage.content;
          lastMessageTime = receivedMessage.createdAt;
          lastMessageSentByUser = false;
        }
      } else if (sentMessage) {
        lastMessage = sentMessage.content;
        lastMessageTime = sentMessage.createdAt;
        lastMessageSentByUser = true;
      } else if (receivedMessage) {
        lastMessage = receivedMessage.content;
        lastMessageTime = receivedMessage.createdAt;
        lastMessageSentByUser = false;
      }

      // Format the timestamp (e.g., "Yesterday", "14:30")
      let formattedTime = null;
      if (lastMessageTime) {
        const date = new Date(lastMessageTime);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
          formattedTime = date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
        } else if (date.toDateString() === yesterday.toDateString()) {
          formattedTime = 'Yesterday';
        } else {
          formattedTime = date.toLocaleDateString([], {
            day: '2-digit',
            month: 'short',
          });
        }
      }

      // Convert profilePicture Buffer to base64 string
      const avatarUrl = user.profilePicture
        ? `data:image/jpeg;base64,${Buffer.from(user.profilePicture).toString('base64')}`
        : null;

      return {
        id: user.id,
        username: user.username,
        avatarUrl,
        lastMessage,
        lastMessageTime: formattedTime,
        isOnline: false, // Implement via WebSocket (e.g., presence system)
        unreadCount: user._count.messagesReceived,
        lastMessageSentByUser,
      };
    });

    return NextResponse.json(contacts, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P1001'
    ) {
      return NextResponse.json(
        { message: 'Database connection error. Please try again later.' },
        { status: 503 }
      );
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { message: 'Database initialization error. Please try again later.' },
        { status: 500 }
      );
    }

    console.error('Fetch users error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}