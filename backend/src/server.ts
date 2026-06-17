import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { env } from './config/env';
import { connectDB } from './config/db';
import { configurePassport } from './config/passport';
import { configureSockets } from './sockets/socketHandler';
import { errorHandler } from './middleware/errorMiddleware';

// Import Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import collegeRoutes from './routes/colleges';
import canteenRoutes from './routes/canteens';
import menuRoutes from './routes/menu';
import orderRoutes from './routes/orders';
import walletRoutes from './routes/wallet';
import paymentRoutes from './routes/payments';
import adminRoutes from './routes/admin';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: env.FRONTEND_URL,
    credentials: true
  }
});

// Store io reference in Express app context
app.set('io', io);

// Connect to MongoDB
connectDB();

// Configure Google OAuth Strategy
configurePassport();

// Setup middlewares
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Configure socket triggers
configureSockets(io);

// Expose API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', userRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/canteens', canteenRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Server check endpoint
app.get('/', (req, res) => {
  res.send('🚀 CampusBites MERN API Server is active...');
});

// Catch-all global error boundary
app.use(errorHandler);

const PORT = env.PORT;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
