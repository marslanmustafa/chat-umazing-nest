import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Message } from 'src/message/message.model';
import { MessageRead } from 'src/message/messageRead.model';

@Injectable()
export class WorkspaceHandlersService {
  handle(server: Server, socket: Socket) {
    this.handleReadMessage(socket);
    this.handleTyping(socket);
    this.handleStopTyping(socket);
  }

private handleTyping(socket: Socket) {
  socket.on('typing', (workspaceId: string) => {
    const user = socket.data.user;

    if (!workspaceId || !user?.id) {
      return;
    }

    socket.to(workspaceId).emit('userTyping', {
      workspaceId,
      userId: user.id,
      name: user.name,
    });
  });
}

private handleStopTyping(socket: Socket) {
  socket.on('stopTyping', (workspaceId: string) => {
    const user = socket.data.user;

    if (!workspaceId || !user?.id) {
      return;
    }

    // Broadcast to all in the room *except the sender*
    socket.to(workspaceId).emit('userStopTyping', {
      workspaceId,
      userId: user.id,
    });
  });
}

private handleReadMessage(socket: Socket) {
  socket.on('readMessage', async ({ workspaceId, messageId, userId }) => {
    if (!workspaceId || !messageId || !userId) return;

    const now = new Date();

    await MessageRead.upsert({
      id: `${messageId}-${userId}`,
      messageId,
      userId,
      readAt: now,
    });

    
    socket.to(workspaceId).emit('messageRead', {
      messageId,
      userId,
      readAt: now,
    });
  });
}

}
