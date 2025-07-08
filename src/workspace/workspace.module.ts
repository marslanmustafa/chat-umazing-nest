import { Module } from '@nestjs/common';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Workspace } from './models/workspace.model';
import { User } from 'src/user/user.model';
import { WorkspaceMember } from './models/workspaceMemeber.model';

@Module({
   imports: [
    SequelizeModule.forFeature([Workspace, WorkspaceMember, User]),
  ],
  controllers: [WorkspaceController],
  providers: [WorkspaceService]
})
export class WorkspaceModule {}
