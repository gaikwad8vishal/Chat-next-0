'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ContactList from '@/components/inner/contact-list';
import GroupList from '@/components/inner/group-list';
import MessageBubble from '@/components/inner/message-bubble';
import ChatHeader from '@/components/inner/chat-header';
import { createChatWebSocket, WebSocketMessage } from '@/lib/websocket';
import { Menu, Paperclip, Smile, Send } from 'lucide-react';
import axios from 'axios';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; username: string };
  status: 'sent' | 'delivered' | 'read';
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();
  const wsRef = useRef<ReturnType<typeof createChatWebSocket> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch username from sessionStorage on the client side
  useEffect(() => {
    const storedUsername = typeof window !== 'undefined' ? sessionStorage.getItem('username') : null;
    setUsername(storedUsername);
  }, []);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (username === null) return;
    if (!username) {
      router.push('/signin');
    } else {
      wsRef.current = createChatWebSocket(username);
      return () => wsRef.current?.disconnect();
    }
  }, [username, router]);

  // Fetch initial messages
  useEffect(() => {
    if (!selectedContact && !selectedGroup) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const endpoint = selectedContact
          ? `/api/messages?userId=${selectedContact}`
          : `/api/messages?groupId=${selectedGroup}`;
        const response = await axios.get(endpoint, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 200) {
          setMessages(response.data.map((msg: any) => ({ ...msg, status: 'delivered' })));
        } else {
          setError(response.data.message || 'Failed to fetch messages');
        }
      } catch (err: any) {
        console.error('Fetch messages error:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data ? err.response.data : 'No response data',
          responseText: err.response?.data ? String(err.response.data).slice(0, 200) : 'No response body',
        });
        setError(
          err.response?.data?.message ||
            'Network error or invalid response from server. Please try again later.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [selectedContact, selectedGroup]);

  // WebSocket event handlers
  useEffect(() => {
    if (!wsRef.current) return;

    wsRef.current.onMessage((message: WebSocketMessage) => {
      if (
        (selectedContact && message.senderId === selectedContact) ||
        (selectedGroup && message.groupId === selectedGroup)
      ) {
        setMessages((prev) => [
          ...prev,
          {
            id: message.messageId || Date.now().toString(),
            content: message.content || '',
            createdAt: message.createdAt || new Date().toISOString(),
            sender: { id: message.senderId, username: message.senderId },
            status: 'delivered',
          },
        ]);
        if (message.messageId) {
          wsRef.current?.sendReadReceipt(message.messageId);
        }
      }
    });

    wsRef.current.onTyping(({ userId, typing }) => {
      setTypingUsers((prev) => {
        const updated = new Set(prev);
        if (typing) {
          updated.add(userId);
        } else {
          updated.delete(userId);
        }
        return updated;
      });
    });

    wsRef.current.onRead((messageId) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: 'read' } : msg
        )
      );
    });
  }, [selectedContact, selectedGroup]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send typing indicator
  useEffect(() => {
    if (!wsRef.current) return;
    wsRef.current.sendTyping(newMessage.length > 0, selectedContact, selectedGroup);
  }, [newMessage, selectedContact, selectedGroup]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !username) return;

    const messageId = Date.now().toString();
    const messageData: Omit<WebSocketMessage, 'type'> = {
      content: newMessage,
      senderId: username,
      recipientId: selectedContact,
      groupId: selectedGroup,
      messageId,
      createdAt: new Date().toISOString(),
    };

    try {
      wsRef.current?.sendMessage(messageData);

      const response = await axios.post('/api/messages', {
        content: newMessage,
        senderId: username,
        recipientId: selectedContact,
        groupId: selectedGroup,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        setMessages((prev) => [
          ...prev,
          {
            id: messageId,
            content: newMessage,
            createdAt: new Date().toISOString(),
            sender: { id: username, username },
            status: 'sent',
          },
        ]);
        setNewMessage('');
      } else {
        setError(response.data.message || 'Failed to send message');
      }
    } catch (err: any) {
      console.error('Send message error:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data ? err.response.data : 'No response data',
        responseText: err.response?.data ? String(err.response.data).slice(0, 200) : 'No response body',
      });
      setError(
        err.response?.data?.message ||
          'Network error or invalid response from server. Please try again later.'
      );
    }
  };

  if (username === null) return null;
  if (!username) return null;

  return (
    <div className="flex h-screen bg-[#f0f2f5] mx-auto max-w-[1440px] font-sans">
      <div
        className={`fixed inset-y-0 left-0 z-30 w-80 bg-[#f0f2f5] p-3 transform transition-transform duration-300 md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:w-[350px] border-r border-gray-200`}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-3xl font-semibold text-[#111b21]">Chats</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-[#54656f]"
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              ✕
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <ContactList
            onSelectContact={(id) => {
              setSelectedContact(id);
              setSelectedGroup(null);
              setIsSidebarOpen(false);
            }}
            selectedContact={selectedContact}
          />
          <GroupList
            onSelectGroup={(id) => {
              setSelectedGroup(id);
              setSelectedContact(null);
              setIsSidebarOpen(false);
            }}
            selectedGroup={selectedGroup}
          />
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className={`fixed top-4 left-4 z-40 md:hidden ${
          isSidebarOpen ? 'hidden' : 'block'
        } text-[#54656f]`}
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Open sidebar</span>
      </Button>

      <div className="flex-1 flex flex-col bg-[#e5ddd5] bg-[url('/whatsapp-bg.png')] bg-repeat">
        <ChatHeader
          contactId={selectedContact}
          groupId={selectedGroup}
          username={username}
        />
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">
              {error}
            </p>
          )}
          {isLoading ? (
            <p className="text-center text-[#54656f] text-sm">Loading messages...</p>
          ) : selectedContact || selectedGroup ? (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  sender={message.sender.username}
                  isOwnMessage={message.sender.username === username}
                  timestamp={new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  status={message.status}
                />
              ))}
              {typingUsers.size > 0 && (
                <p className="text-xs text-[#54656f] italic p-2">
                  {[...typingUsers].join(', ') } {typingUsers.size > 1 ? 'are' : 'is'} typing...
                </p>
              )}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <p className="text-center text-[#54656f] mt-10 text-sm">
              Select a contact or group to start chatting
            </p>
          )}
        </div>
        {(selectedContact || selectedGroup) && (
          <form
            onSubmit={handleSendMessage}
            className="p-2 sm:p-3 bg-[#f0f2f5] flex items-center gap-2"
          >
            <Button
              variant="ghost"
              size="icon"
              className="text-[#54656f]"
              onClick={() => alert('Attachment feature coming soon!')}
            >
              <Paperclip className="h-5 w-5" />
              <span className="sr-only">Attach file</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#54656f]"
              onClick={() => alert('Emoji picker coming soon!')}
            >
              <Smile className="h-5 w-5" />
              <span className="sr-only">Add emoji</span>
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
              disabled={isLoading}
              className="flex-1 rounded-full border-none bg-white p-2 sm:p-3 text-[#111b21] text-sm sm:text-sm focus:ring-0 focus:outline-none shadow-sm"
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="text-[#075e54] hover:bg-gray-200"
              disabled={isLoading || !newMessage.trim()}
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}