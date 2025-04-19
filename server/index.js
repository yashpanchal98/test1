import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

import auth from './routes/auth.js'

// Setup __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientPath = path.join(__dirname, '../client');

const app = express();
const server = http.createServer(app);

// ✅ Enable CORS for REST API routes (optional if you don't use them yet)
app.use(cors({
  origin: 'http://localhost:5173', // your Vite client
  methods: ['GET', 'POST'],
  credentials: true
}));

// ✅ Setup Socket.IO 
const io = new Server(server);

// Serve static files (optional for static HTML)
app.use(express.static(clientPath));

// Serve the static HTML file for demo/testing
app.get('/', (req, res) => {
  res.sendFile(path.join(clientPath, './basic.html'));
});

// ✅ Socket.IO connection
io.on('connection', (socket) => {
  const username = 'User' + Math.floor(Math.random() * 1000);
  socket.username = username;

  socket.emit('new user', username);

  socket.on('connected', () => {
    socket.broadcast.emit('connected', `${socket.username} has joined the chat`);
  });

  socket.on('chat message', (msg) => {
    const messageToSend = `${socket.username}: ${msg}`;
    socket.broadcast.emit('chat message', messageToSend); // broadcast to ALL
  });

  socket.on('typing', () => {
    io.emit('typing', `${socket.username} is typing...`); // Now broadcast to all users
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('disconnected', `${socket.username} has left the chat`);
  });
});

// Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});