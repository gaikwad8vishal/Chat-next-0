export interface WebSocketMessage {
  type: 'message' | 'typing' | 'read';
  content?: string;
  senderId: string;
  recipientId?: string;
  groupId?: string;
  messageId?: string;
  createdAt?: string;
  typing?: boolean;
}

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private username: string;
  private messageCallback: (message: WebSocketMessage) => void = () => {};
  private typingCallback: (data: { userId: string; typing: boolean }) => void = () => {};
  private readCallback: (messageId: string) => void = () => {};

  constructor(username: string) {
    this.url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    this.username = username;
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      // Send authentication message
      this.ws?.send(JSON.stringify({ type: 'auth', username: this.username }));
    };

    this.ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        if (data.type === 'message') {
          this.messageCallback(data);
        } else if (data.type === 'typing') {
          this.typingCallback({ userId: data.senderId, typing: data.typing || false });
        } else if (data.type === 'read') {
          this.readCallback(data.messageId || '');
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected. Reconnecting...');
      setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }

  sendMessage(message: Omit<WebSocketMessage, 'type'>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'message', ...message }));
    }
  }

  sendTyping(typing: boolean, recipientId?: string, groupId?: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'typing',
          senderId: this.username,
          recipientId,
          groupId,
          typing,
        })
      );
    }
  }

  sendReadReceipt(messageId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'read',
          senderId: this.username,
          messageId,
        })
      );
    }
  }

  onMessage(callback: (message: WebSocketMessage) => void) {
    this.messageCallback = callback;
  }

  onTyping(callback: (data: { userId: string; typing: boolean }) => void) {
    this.typingCallback = callback;
  }

  onRead(callback: (messageId: string) => void) {
    this.readCallback = callback;
  }

  disconnect() {
    this.ws?.close();
  }
}

export function createChatWebSocket(username: string) {
  const ws = new ChatWebSocket(username);
  ws.connect();
  return ws;
}