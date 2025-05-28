'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Contact {
  id: string;
  username: string;
  avatarUrl?: string; // Added for profile picture
  lastMessage?: string;
  lastMessageTime?: string;
  isOnline?: boolean;
  unreadCount?: number;
  lastMessageSentByUser?: boolean; // To indicate if last message was sent by the logged-in user
}

interface ContactListProps {
  onSelectContact: (contactId: string | null) => void;
  selectedContact: string | null;
}

export default function ContactList({ onSelectContact, selectedContact }: ContactListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/auth/users');
        const data = await response.json();
        if (response.ok) {
          // Mock enhanced data (update API in production to include avatarUrl, lastMessage, lastMessageTime, isOnline, unreadCount, lastMessageSentByUser)
          const enhancedData = data.map((contact: Contact, index: number) => ({
            ...contact,
            avatarUrl: `/default-avatar.jpg`, // Replace with real avatarUrl from API
            lastMessage: index % 2 === 0 ? 'See you tomorrow!' : 'Can we meet now?',
            lastMessageTime:
              index % 3 === 0
                ? 'Yesterday'
                : new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
            isOnline: index % 2 === 0,
            unreadCount: index % 3 === 0 ? 2 : 0,
            lastMessageSentByUser: index % 2 === 0, // Mock: true if sent by user
          }));
          setContacts(enhancedData);
        }
      } catch (err) {
        console.error('Error fetching contacts:', err);
      }
    };
    fetchContacts();
  }, []);

  return (
    <div className="space-y-0.5">
      {contacts.map((contact) => (
        <button
          key={contact.id}
          onClick={() => onSelectContact(contact.id)}
          className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.01] hover:bg-[#e9ecef] ${
            selectedContact === contact.id ? 'bg-[#e9ecef]' : ''
          }`}
        >
          {/* Avatar with Online Status */}
          <div className="relative mr-3 ">
            <Avatar className="h-12 w-12 border-2  border-[#d1d7db]">
              <AvatarImage src={contact.avatarUrl || '/default-avatar.jpg'} alt={contact.username} />
              <AvatarFallback className="bg-[#d1d7db] text-[#111b21] text-sm">
                {contact.username[0]}
              </AvatarFallback>
            </Avatar>
            {contact.isOnline && (
              <span className="absolute bottom-0 right-0 h-5 w-5 bg-[#f0f2f5] rounded-full flex items-center justify-center">
                <span className="h-4 w-4 bg-[#00af9c] rounded-full" />
              </span>
            )}
          </div>

          {/* Contact Info */}
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-[#111b21]">{contact.username}</p>
            {contact.lastMessage && (
              <p
                className={`text-xs truncate ${
                  contact.unreadCount && contact.unreadCount > 0
                    ? 'text-[#00af9c] font-medium'
                    : 'text-[#54656f]'
                }`}
              >
                {contact.lastMessageSentByUser ? 'You: ' : ''}
                {contact.lastMessage}
              </p>
            )}
          </div>

          {/* Timestamp and Unread Count */}
          <div className="flex flex-col items-end">
            {contact.lastMessageTime && (
              <p
                className={`text-xs ${
                  contact.unreadCount && contact.unreadCount > 0
                    ? 'text-[#00af9c]'
                    : 'text-[#54656f]'
                }`}
              >
                {contact.lastMessageTime}
              </p>
            )}
            {contact.unreadCount && contact.unreadCount > 0 ? (
              <span className="mt-1 h-5 w-5 flex items-center justify-center bg-[#00af9c] text-white text-xs rounded-full">
                {contact.unreadCount}
              </span>
            ) : (
              <span className="h-5 w-5" /> // Spacer for alignment
            )}
          </div>
        </button>
      ))}
    </div>
  );
}