import { Module } from '@nestjs/common';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Workspace } from './models/workspace.model';
import { User } from 'src/user/user.model';
import { WorkspaceMember } from './models/workspaceMemeber.model';
import { Message } from 'src/message/message.model';
import { WorkspaceChatGateway } from './gateway/gateway';
import { WorkspaceMessageHandlersService } from './handlers/workspace-message-handlers.service';
import { WorkspaceHandlersService } from './handlers/workspace-handlers.service';

@Module({
   imports: [
    SequelizeModule.forFeature([Workspace, WorkspaceMember, User, Message]),
  ],
  controllers: [WorkspaceController],
  providers: [WorkspaceService, WorkspaceMessageHandlersService, WorkspaceHandlersService]
})
export class WorkspaceModule {}
