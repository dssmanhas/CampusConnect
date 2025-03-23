import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import groupRoutes from './routes/groups.js';
import cookieParser from 'cookie-parser'

dotenv.config({
  path:'./env'
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(cookieParser())

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack); // Logs the error stack trace
  res.status(500).send({ error: 'Something went wrong!' });
});
// Socket.IO connection handling
io.on('connection', (socket) => {
  socket.on('join_group', (groupId) => {
    socket.join(groupId);
  });

  socket.on('send_message', (data) => {
    io.to(data.groupId).emit('receive_message', data);
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});