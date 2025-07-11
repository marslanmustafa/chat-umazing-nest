import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Message } from 'src/message/message.model';
import { User } from 'src/user/user.model';
import { Workspace } from '../models/workspace.model';
import { WorkspaceMember } from '../models/workspaceMemeber.model';
import { CryptUtil } from 'src/utils/crypt.util';

@Injectable()
export class WorkspaceMessageHandlersService {
  private activeRooms: Map<string, string[]> = new Map();

  handle(server: Server, socket: Socket) {
    this.handleSendMessage(server, socket);
    this.handleJoinWorkspace(socket);
    this.handleLeaveChatRoom(socket);
    this.handleDisconnect();
  }

  private handleSendMessage(server: Server, socket: Socket) {
    socket.on('sendMessage', async ({ workspaceId, content }) => {
      try {
        const senderId = socket.data.user.id;
        console.log({ senderId, workspaceId, content });

        const workspace = await Workspace.findOne({
          where: { id: workspaceId },
        });

        if (!workspace) {
          socket.emit('sendMessage_Error', {
            message: "Workspace Not Found"
          })
        }

        const isMember = await WorkspaceMember.findOne({
          where: { workspaceId, userId: senderId },
        });

        if (!isMember) {
          socket.emit('sendMessage_Error', {
            message: "You are not a member of this workspace"
          });
        }


        const message = await Message.create({
          id: `workspace-msg-${Date.now()}-${CryptUtil.generateId()}`,
          workspaceId,
          SenderId: senderId,
          message_text: content,
          type: 'workspace'
        });

        const sender = await User.findByPk(senderId, { attributes: ['id', 'name', 'email', 'imageUrl'] });
        const workspaceMembers = await User.findAll({
          include: [{
            model: WorkspaceMember,
            as: 'member',
            where: { workspaceId }
          }],
          attributes: ['id', 'name', 'email', 'imageUrl']
        });

        const messagePayload = {
          workspaceId,
          message: {
            id: message.id,
            message_text: message.message_text,
            SenderId: senderId,
            Sender: sender,
            timestamp: message.createdAt,
            isRead: false,
          },
        };

        // Emit to sender
        socket.emit('receiveMessage', messagePayload);
        const socketsInRoom = await server.in(workspaceId).fetchSockets();
        console.log(`Number of users in workspace ${workspaceId}:`, socketsInRoom.length);
        socket.to(workspaceId).emit('receiveMessage', messagePayload);
        // const memberIds = workspaceMembers.map(u => u.id);
        // const workspaceMembersSockets = Array.from(server.sockets.values()).filter(
        //   (s: any) => memberIds.includes(s.data?.user?.id)
        // );

        // console.log(workspaceMembersSockets)

        // if (workspaceMembersSockets.length) {
        //   workspaceMembersSockets.forEach(socket => {
        //     socket.emit('receiveMessage', messagePayload);
        //   });
        // }

        //   const usersInRoom = this.activeRooms.get(room.id) || [];
        //   if (usersInRoom.includes(receiverId)) {
        //     await Message.update({ read: true }, { where: { id: message.id } });
        //     messagePayload.message.isRead = true;

        //     socket.emit('messageRead', { roomId: room.id, messageId: message.id });
        //     receiverSocket.emit('messageRead', { roomId: room.id, messageId: message.id });
        //   }
        // } else {
        //   console.log(`Receiver ${receiverId} is not connected.`);
        // }

        // const senderUnreadCount = await Message.count({
        //   where: { read: false, ReceiverId: senderId, RoomId: room.id },
        // });
        // const receiverUnreadCount = await Message.count({
        //   where: { read: false, ReceiverId: receiverId, RoomId: room.id },
        // });

        // const updatedRoomForSender = {
        //   roomId: room.id,
        //   lastMessage: {
        //     senderId,
        //     receiverId,
        //     content: message.message_text,
        //     timestamp: message.createdAt,
        //     isRead: messagePayload.message.isRead,
        //   },
        //   unreadMessages: senderUnreadCount,
        // };

        // const updatedRoomForReceiver = {
        //   roomId: room.id,
        //   lastMessage: {
        //     senderId,
        //     receiverId,
        //     content: message.message_text,
        //     timestamp: message.createdAt,
        //     isRead: messagePayload.message.isRead,
        //   },
        //   unreadMessages: receiverUnreadCount,
        // };

        // socket.emit('newMessage', updatedRoomForSender);
        // if (receiverSocket) {
        //   receiverSocket.emit('newMessage', updatedRoomForReceiver);
        // }
      } catch (err) {
        console.error('Error sending message:', err);
      }
    });
  }

 private handleJoinWorkspace(socket: Socket) {
  socket.on('joinWorkspace', (workspaceId: string) => {

    socket.join(workspaceId);

    if (!this.activeRooms.has(workspaceId)) {
      this.activeRooms.set(workspaceId, []);
    }
    const users = this.activeRooms.get(workspaceId) ?? [];
    if (!users.includes(socket.data.user.id)) {
      users.push(socket.data.user.id);
    }
    this.activeRooms.set(workspaceId, users);
  });
}


  private handleLeaveChatRoom(socket: Socket) {
    socket.on('leaveChatRoom', (roomId: string) => {
      if (this.activeRooms.has(roomId)) {
        const users = (this.activeRooms.get(roomId) ?? []).filter(id => id !== socket.data.user.id);
        if (users.length === 0) {
          this.activeRooms.delete(roomId);
        } else {
          this.activeRooms.set(roomId, users);
        }
      }
    });
  }

  private handleDisconnect() {
    this.activeRooms.forEach((users, roomId) => {
      this.activeRooms.set(
        roomId,
        users.filter(id => id !== id) // Note: requires socket passed here if you want per socket cleanup
      );
      if ((this.activeRooms.get(roomId)?.length ?? 0) === 0) {
        this.activeRooms.delete(roomId);
      }
    });
  }
}
