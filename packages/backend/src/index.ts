import { config } from './config/index.js';
import './lib/nodemailer.js';
import express from 'express';
import { handleError } from './middleware/error-handler.js';
import { authRouter } from './routes/auth.js';
import { messagesRouter } from './routes/messages.js';
import { createServer } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import log from './lib/winston.js'

const app = express();
const server = createServer(app);

const wss = new WebSocketServer({ server });
wss.on('connection', (ws, req) => {
  log.info('User connected', req.socket.remoteAddress);

  const userJoinedData = JSON.stringify({ event: 'userJoined' });
  wss.clients.forEach(client => {
    if (client !== ws && client.readyState === WebSocket.OPEN) client.send(userJoinedData);
  });

  ws.on('close', () => {
    log.info('User disconnected');

    const userLeftData = JSON.stringify({ event: 'userLeft' });
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(userLeftData);
    });
  });
});

app.use(express.json());
app.use('/api', authRouter);
app.use('/api', messagesRouter);
app.get('/health', (_, res) => res.sendStatus(200));
app.use(handleError);

server.listen({ port: config.server.port, host: config.server.host }, () => {
  console.log(`Server running on http://${config.server.host}:${config.server.port}`);
});
// app.listen(config.server.port, () => {
//   console.log(`Server running on port ${config.server.port}`);
// });
