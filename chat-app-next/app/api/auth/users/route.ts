import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

export async function GET() {
  try {
    // Fetch the logged-in user's session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized: No valid session found' },
        { status: 401 }
      );
    }

    const loggedInUserId = session.user.id;

    // Fetch the logged-in user's contacts
    const userWithContacts = await prisma.user.findUnique({
      where: { id: loggedInUserId },
      select: {
        contacts: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
            messagesSent: {
              where: { recipientId: loggedInUserId },
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: { id: true, content: true, createdAt: true },
            },
            messagesReceived: {
              where: { senderId: loggedInUserId },
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: { id: true, content: true, createdAt: true },
            },
            _count: {
              select: {
                messagesReceived: {
                  where: { senderId: loggedInUserId, read: false },
                },
              },
            },
          },
        },
      },
    });

    // Handle case where user or contacts are not found
    if (!userWithContacts) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    if (!userWithContacts.contacts || userWithContacts.contacts.length === 0) {
      return NextResponse.json(
        { message: 'No contacts available. Add friends to start chatting!' },
        { status: 200 }
      );
    }

    // Process contacts
    const contacts = userWithContacts.contacts.map((user) => {
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

      return {
        id: user.id,
        username: user.username,
        avatarUrl: user.profilePicture || '/default-avatar.jpg',
        lastMessage,
        lastMessageTime: formattedTime,
        isOnline: false, // Could be enhanced with WebSocket
        unreadCount: user._count.messagesReceived,
        lastMessageSentByUser,
      };
    });

    return NextResponse.json(contacts, { status: 200 });
  } catch (error: unknown) {
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'N/A',
      stack: error instanceof Error ? error.stack : undefined,
      code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : 'N/A',
    };
    console.error('Fetch contacts error:', errorDetails);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P1001') {
        return NextResponse.json(
          { message: 'Database connection error. Please try again later.' },
          { status: 503 }
        );
      }
      if (error.code === 'P2025') {
        return NextResponse.json(
          { message: 'User or contacts not found' },
          { status: 404 }
        );
      }
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { message: 'Database initialization error. Please contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Server error fetching contacts', details: errorDetails },
      { status: 500 }
    );
  }
}