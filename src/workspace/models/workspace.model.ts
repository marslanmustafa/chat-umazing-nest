import {
  Table,
  Column,
  Model,
  PrimaryKey,
  HasMany,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { WorkspaceMember } from './workspaceMemeber.model';
import { User } from 'src/user/user.model';

@Table
export class Workspace extends Model {
  @PrimaryKey
  @Column
  declare id: string;

  @Column
  declare name: string;

  @Column({
    type: DataType.ENUM('public', 'private'),
  })
  declare type: 'public' | 'private';

  @ForeignKey(() => User)
  @Column
  declare createdBy: string;

  @BelongsTo(() => User)
  creator: User;


  @HasMany(() => WorkspaceMember)
  members: WorkspaceMember[];
}
