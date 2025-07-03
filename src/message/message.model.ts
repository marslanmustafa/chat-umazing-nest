// src/message/message.model.ts
import {
  Column,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  Default,
} from 'sequelize-typescript';
import { ChatRoom } from '../chatroom/chatroom.model';
import { User } from '../user/user.model';

interface MessageCreationAttrs {
  id: string;
  RoomId: string;
  SenderId: string;
  ReceiverId: string;
  message_text: string;
}

@Table
export class Message extends Model<Message, MessageCreationAttrs> {
  @PrimaryKey
  @Column
  declare id: string;

  @Column({ type: 'LONGTEXT' })
  declare message_text: string;

  @Default(false)
  @Column
  declare read: boolean;

  @Default(() => new Date())
  @Column
  declare timestamp: Date;

  @ForeignKey(() => ChatRoom)
  @Column
  declare RoomId: string;

  @ForeignKey(() => User)
  @Column
  declare SenderId: string;

  @ForeignKey(() => User)
  @Column
  declare ReceiverId: string;

  @BelongsTo(() => ChatRoom)
  declare chatRoom: ChatRoom;

  @BelongsTo(() => User, 'SenderId')
  declare Sender: User;

  @BelongsTo(() => User, 'ReceiverId')
  declare Receiver: User;
}
