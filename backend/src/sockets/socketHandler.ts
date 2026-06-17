import { Server, Socket } from 'socket.io';

export const configureSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);

    // Join private room named by student/user ID
    socket.on('join_user_room', (userId: string) => {
      if (userId) {
        socket.join(userId);
        console.log(`👤 Socket ${socket.id} joined user room: ${userId}`);
      }
    });

    // Join global admin updates room
    socket.on('join_admin_room', () => {
      socket.join('admins');
      console.log(`👑 Socket ${socket.id} joined admin room`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};
