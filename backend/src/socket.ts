import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from './utils/jwt';
import { prisma } from './db';
import { logger } from './logger';

let io: Server | null = null;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, { cors: { origin: '*' } });
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('No token'));
    try {
      const payload = verifyToken<{ sub: string; sid: string }>(String(token));
      (socket as any).user = { id: payload.sub, sid: payload.sid };
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).user.id as string;
    socket.join(`user:${userId}`);
    socket.on('conversation:join', (convId: string) => {
      socket.join(`conv:${convId}`);
    });
    socket.on('conversation:leave', (convId: string) => {
      socket.leave(`conv:${convId}`);
    });
    socket.on('typing', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conv:${conversationId}`).emit('typing', { conversationId, userId });
    });
    socket.on('disconnect', () => logger.debug({ userId }, 'socket disconnected'));
  });

  return io;
}

export function getIO(): Server | null {
  return io;
}

export async function emitToUser(userId: string, event: string, payload: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

export async function emitToConversation(conversationId: string, event: string, payload: any) {
  if (!io) return;
  io.to(`conv:${conversationId}`).emit(event, payload);
}