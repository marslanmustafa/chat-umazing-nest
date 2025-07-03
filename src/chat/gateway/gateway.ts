import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { MessageHandlersService } from '../handlers/message-handlers.service';
import { RoomHandlersService } from '../handlers/room-handlers.service';

@WebSocketGateway({
  // transports: ['websocket'],
  cors: {
    origin: '*', // replace with frontend origin in prod
    methods: ['GET', 'POST'],
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messageHandlers: MessageHandlersService,
    private readonly roomHandlers: RoomHandlersService,
  ) {}

  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.error('Authentication error: No token provided');
      socket.disconnect();
      return;
    }

    try {
      const decoded = jwt.verify(token, 'umazing-key_jwt_secret_key');
      (socket.data as any).user = decoded; // store decoded user in socket.data
      socket.emit('welcome', {
        message: `Welcome user ${(socket.data as any).user.email}!`,
      });
      console.log('User authenticated:', {
        id: (socket.data as any).user.id,
        email: (socket.data as any).user.email,
      });
      
      this.messageHandlers.handle(this.server, socket);
      this.roomHandlers.handle(this.server, socket);

    } catch (err) {
      console.error('Authentication error:', err.message);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    console.log(`Socket disconnected: ${socket.id}`);
  }
}
