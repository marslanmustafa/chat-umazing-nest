import {
  Table,
  Column,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Workspace } from './workspace.model';
import { User } from 'src/user/user.model';

@Table
export class WorkspaceMember extends Model {
  @PrimaryKey
  @Column
  declare id: string;

  @ForeignKey(() => Workspace)
  @Column
  declare workspaceId: string;

  @BelongsTo(() => Workspace)
  workspace: Workspace;

  @ForeignKey(() => User)
  @Column
  declare userId: string;

  @BelongsTo(() => User)
  member: User;
}
