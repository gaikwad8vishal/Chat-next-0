'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle } from 'lucide-react';

interface Contact {
  id: string;
  username: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  isOnline?: boolean;
  unreadCount?: number;
  lastMessageSentByUser?: boolean;
}

interface ContactListProps {
  onSelectContact: (contactId: string | null) => void;
  selectedContact: string | null;
}

export default function ContactList({ onSelectContact, selectedContact }: ContactListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [noContactsMessage, setNoContactsMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get('/api/contacts', {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        });

        if (response.status === 200) {
          if (response.data.message) {
            setNoContactsMessage(response.data.message);
            setContacts([]);
            setError(null);
            return;
          }

          setContacts(response.data);
          setNoContactsMessage(null);
          setError(null);
        } else {
          throw new Error(response.data.message || 'Failed to fetch contacts');
        }
      } catch (err: any) {
        const errorDetails = {
          message: err.message || 'Unknown error',
          status: err.response?.status || 'No status',
          statusText: err.response?.statusText || 'No status text',
          data: err.response?.data || 'No response data',
          responseText: err.response?.data?.message
            ? String(err.response.data.message)
            : 'No response body',
          requestUrl: err.config?.url || 'No URL',
          requestMethod: err.config?.method || 'No method',
        };
        console.error('Error fetching contacts:', errorDetails);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Unable to fetch contacts. Please try again later.'
        );
        setNoContactsMessage(null);
      }
    };
    fetchContacts();
  }, []);

  return (
    <div className="space-y-0.5">
      {error && (
        <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md mb-2">
          {error}
        </p>
      )}
      {contacts.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center h-full py-10 text-center">
          <MessageCircle className="h-16 w-16 text-[#00af9c] mb-4" />
          <h2 className="text-lg font-semibold text-[#111b21] mb-2">
            {noContactsMessage ? noContactsMessage.split('.')[0] : "Let's Begin Chat!"}
          </h2>
          <p className="text-sm text-[#54656f] max-w-xs">
            {noContactsMessage
              ? noContactsMessage.split('.')[1]?.trim() || 'Start a conversation with your friends or add new contacts to get started.'
              : 'Start a conversation with your friends or add new contacts to get started.'}
          </p>
          <button
            className="mt-4 px-4 py-2 bg-[#00af9c] text-white text-sm font-medium rounded-lg hover:bg-[#009c8a] transition-colors"
            onClick={() => {
              // Replace with navigation, e.g., router.push('/add-contact')
              alert('Navigate to add contacts or invite friends!');
            }}
          >
            Find Friends
          </button>
        </div>
      )}
      {contacts.length > 0 && (
        contacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onSelectContact(contact.id)}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.01] hover:bg-[#e9ecef] ${
              selectedContact === contact.id ? 'bg-[#e9ecef]' : ''
            }`}
          >
            <div className="relative mr-3">
              <Avatar className="h-12 w-12 border-2 border-[#d1d7db]">
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
            <div className="flex flex-col items-end">
              {contact.lastMessageTime && (
                <p
                  className={`text-xs ${
                    contact.unreadCount && contact.unreadCount > 0
                      ? 'text-[#00af9c]'
                      : 'text-[#54656f]'
                  }`}
                >
                  twentyfour
                </p>
              )}
              {contact.unreadCount && contact.unreadCount > 0 ? (
                <span className="mt-1 h-5 w-5 flex items-center justify-center bg-[#00af9c] text-white text-xs rounded-full">
                  {contact.unreadCount}
                </span>
              ) : (
                <span className="h-5 w-5" />
              )}
            </div>
          </button>
        ))
      )}
    </div>
  );
}