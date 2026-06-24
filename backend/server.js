const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Make io accessible in routes
app.set('io', io);

// Serve local uploads folder statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Free Local Image Upload Route
app.use('/api/upload', require('./routes/upload'));

// Google Drive integration
app.use('/api/drive', require('./routes/drive'));

// Contact form email route
app.use('/api/contact', require('./routes/contact'));


// Routes (Mocked for Firebase migration to prevent crashes)
app.use('/api', (req, res, next) => {
  // Prevent unhandled rejections from old Mongoose models by returning mock data
  if (req.path === '/donations') return res.json({ donations: [] });
  if (req.path === '/analytics/platform') return res.json({ analytics: {} });
  if (req.path === '/ngos/dashboard') return res.json({});
  if (req.path === '/ngos/nearby-donations') return res.json({ donations: [] });
  if (req.path === '/volunteers/dashboard') return res.json({});
  if (req.path === '/admin/stats') return res.json({});
  if (req.path === '/admin/users') return res.json({ users: [] });
  if (req.path === '/notifications') return res.json({ notifications: [] });
  
  // For anything else, return an empty successful response
  res.json({ success: true, message: "Firebase migration in progress", data: [] });
});

// Old Mongoose routes (Commented out during Firebase migration)
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/donations', require('./routes/donations'));
// app.use('/api/ngos', require('./routes/ngos'));
// app.use('/api/volunteers', require('./routes/volunteers'));
// app.use('/api/admin', require('./routes/admin'));
// app.use('/api/notifications', require('./routes/notifications'));
// app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'FoodBridge API is running', timestamp: new Date() });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server without MongoDB (Using Firebase instead)
server.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 FoodBridge server running on port ${process.env.PORT || 5000}`);
  console.log('✅ Firebase configured for database operations');
});
