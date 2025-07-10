import { Module } from "@nestjs/common";
import { WorkspaceChatGateway } from "./gateway";
import { WorkspaceMessageHandlersService } from "../handlers/workspace-message-handlers.service";
import { WorkspaceHandlersService } from "../handlers/workspace-handlers.service";

@Module({
  providers: [WorkspaceChatGateway, WorkspaceMessageHandlersService, WorkspaceHandlersService]
})

export class WorkspaceGatewayModule {}