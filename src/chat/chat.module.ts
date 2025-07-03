import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatRoom } from 'src/chatroom/chatroom.model';
import { Message } from 'src/message/message.model';
import { User } from 'src/user/user.model';
import { AuthModule } from 'src/auth/auth.module';

@Module({
   imports: [
    SequelizeModule.forFeature([ChatRoom, Message, User]),
    AuthModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
