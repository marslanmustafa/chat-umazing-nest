// src/user/user.model.ts
import {
  Column,
  Table,
  Model,
  HasMany,
  PrimaryKey,
} from 'sequelize-typescript';
import { ChatRoom } from '../chatroom/chatroom.model';
import { Message } from '../message/message.model';

@Table
export class User extends Model<User> {
  @PrimaryKey
  @Column
  declare id: string;

  @Column
  declare name: string;

  @Column
  declare email: string;

  @Column
  declare password: string;

  @Column({ defaultValue: '' })
  declare imageUrl: string;

  @HasMany(() => ChatRoom, 'UserId1')
  declare chatRoomsAsUser1: ChatRoom[];

  @HasMany(() => ChatRoom, 'UserId2')
  declare chatRoomsAsUser2: ChatRoom[];

  @HasMany(() => Message, 'SenderId')
  declare sentMessages: Message[];

  @HasMany(() => Message, 'ReceiverId')
  declare receivedMessages: Message[];
}
