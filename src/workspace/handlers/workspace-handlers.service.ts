import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Message } from 'src/message/message.model';

@Injectable()
export class WorkspaceHandlersService {
  handle(server: Server, socket: Socket) {
    this.handleMessageRead(server, socket);
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

  private handleMessageRead(server: Server, socket: Socket) {
    socket.on('messageRead', async ({ workspaceId }: { workspaceId: string }) => {
      try {
        const user = socket.data.user;
        if (!user?.id || !workspaceId) return;

        await Message.update(
          { read: true },
          { where: { workspaceId: workspaceId, ReceiverId: user.id, read: false } }
        );

        server.to(workspaceId).emit('userMessageRead', {
          workspaceId,
          userId: user.id,
        });
      } catch (err) {
        console.error('Error in messageRead:', err);
      }
    });
  }
}
