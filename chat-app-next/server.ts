import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import next from 'next';
import { parse } from 'url';

const port = parseInt(process.env.PORT || '3001', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Map of username to WebSocket client
const clients = new Map<string, WebSocket>();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    let username: string | null = null;

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'auth') {
          username = message.username;
          clients.set(username, ws);
          console.log(`User ${username} connected`);
          return;
        }

        if (!username) return;

        if (message.type === 'message') {
          // Broadcast to recipient or group members
          if (message.recipientId) {
            const recipientWs = clients.get(message.recipientId);
            if (recipientWs) {
              recipientWs.send(JSON.stringify(message));
            }
            // Send back to sender
            ws.send(JSON.stringify(message));
          } else if (message.groupId) {
            // Fetch group members (simplified; use Prisma in production)
            clients.forEach((clientWs, clientUsername) => {
              if (clientUsername !== username) {
                clientWs.send(JSON.stringify(message));
              }
            });
            ws.send(JSON.stringify(message));
          }
        } else if (message.type === 'typing') {
          if (message.recipientId) {
            const recipientWs = clients.get(message.recipientId);
            if (recipientWs) {
              recipientWs.send(JSON.stringify(message));
            }
          } else if (message.groupId) {
            clients.forEach((clientWs, clientUsername) => {
              if (clientUsername !== username) {
                clientWs.send(JSON.stringify(message));
              }
            });
          }
        } else if (message.type === 'read') {
          const senderWs = clients.get(message.senderId);
          if (senderWs) {
            senderWs.send(JSON.stringify(message));
          }
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    });

    ws.on('close', () => {
      if (username) {
        clients.delete(username);
        console.log(`User ${username} disconnected`);
      }
    });
  });

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});