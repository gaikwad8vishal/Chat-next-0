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
import { Menu } from 'lucide-react';

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
  const router = useRouter();
  const username = sessionStorage.getItem('username');
  const wsRef = useRef<ReturnType<typeof createChatWebSocket> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
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
        const response = await fetch(endpoint);
        const data = await response.json();
        if (response.ok) {
          setMessages(data.map((msg: any) => ({ ...msg, status: 'delivered' })));
        } else {
          setError(data.message || 'Failed to fetch messages');
        }
      } catch (err) {
        setError('Network error. Please try again later.');
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
      // Send via WebSocket
      wsRef.current?.sendMessage(messageData);

      // Save to database
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          senderId: username,
          recipientId: selectedContact,
          groupId: selectedGroup,
        }),
      });

      if (response.ok) {
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
        const data = await response.json();
        setError(data.message || 'Failed to send message');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    }
  };

  if (!username) return null;

  return (
    <div className="flex h-screen bg-background mx-auto max-w-[1280px]">
      {/* Sidebar (Hidden on mobile, toggleable) */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-muted p-4 border-r transform transition-transform duration-300 md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:w-80`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground">ZapLink</h2>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            ✕
          </Button>
        </div>
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

      {/* Mobile Sidebar Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className={`fixed top-4 left-4 z-40 md:hidden ${
          isSidebarOpen ? 'hidden' : 'block'
        }`}
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Open sidebar</span>
      </Button>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[url('/whatsapp-bg.png')] bg-repeat md:bg-gray-100">
        <ChatHeader
          contactId={selectedContact}
          groupId={selectedGroup}
          username={username}
        />
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
              {error}
            </p>
          )}
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading messages...</p>
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
                <p className="text-sm text-muted-foreground italic p-2">
                  {[...typingUsers].join(', ')} {typingUsers.size > 1 ? 'are' : 'is'} typing...
                </p>
              )}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <p className="text-center text-muted-foreground mt-10">
              Select a contact or group to start chatting
            </p>
          )}
        </div>
        {(selectedContact || selectedGroup) && (
          <form
            onSubmit={handleSendMessage}
            className="p-2 sm:p-4 border-t bg-background flex items-center gap-2"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 rounded-full border border-input bg-white p-2 sm:p-3 text-foreground text-sm sm:text-base focus:border-blue-600 focus:outline-none"
            />
            <Button
              type="submit"
              className="rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200 px-4 sm:px-6"
              disabled={isLoading || !newMessage.trim()}
            >
              Send
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}