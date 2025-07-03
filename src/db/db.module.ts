// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { sequelizeConfig } from './sequelize.config';
import { User } from 'src/user/user.model';
import { ChatRoom } from 'src/chatroom/chatroom.model';
import { Message } from 'src/message/message.model';

@Module({
  imports: [SequelizeModule.forRoot(sequelizeConfig),
  SequelizeModule.forFeature([User, ChatRoom, Message])],
})
export class DatabaseModule { }
