import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route'; // adjust if in a different folder

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized: No valid session found' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const userWithContacts = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        contacts: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
            messagesSent: {
              where: { recipientId: userId },
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: { content: true, createdAt: true },
            },
            messagesReceived: {
              where: { senderId: userId },
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: { content: true, createdAt: true },
            },
            _count: {
              select: {
                messagesReceived: {
                  where: { senderId: userId, read: false },
                },
              },
            },
          },
        },
      },
    });

    if (!userWithContacts || !userWithContacts.contacts.length) {
      return NextResponse.json({
        message: 'No contacts available. Add friends to start chatting!',
      });
    }

    const contacts = userWithContacts.contacts.map((contact) => {
      const sent = contact.messagesSent[0];
      const received = contact.messagesReceived[0];

      let lastMessage = null;
      let lastMessageTime = null;
      let lastMessageSentByUser = false;

      if (sent && received) {
        if (sent.createdAt > received.createdAt) {
          lastMessage = sent.content;
          lastMessageTime = sent.createdAt;
          lastMessageSentByUser = true;
        } else {
          lastMessage = received.content;
          lastMessageTime = received.createdAt;
          lastMessageSentByUser = false;
        }
      } else if (sent) {
        lastMessage = sent.content;
        lastMessageTime = sent.createdAt;
        lastMessageSentByUser = true;
      } else if (received) {
        lastMessage = received.content;
        lastMessageTime = received.createdAt;
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
        id: contact.id,
        username: contact.username,
        avatarUrl: contact.profilePicture || '/default-avatar.jpg',
        lastMessage,
        lastMessageTime: formattedTime,
        unreadCount: contact._count.messagesReceived,
        lastMessageSentByUser,
        isOnline: false, // WebSocket integration later
      };
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { message: 'Failed to fetch contacts. Please try again later.' },
      { status: 500 }
    );
  }
}
