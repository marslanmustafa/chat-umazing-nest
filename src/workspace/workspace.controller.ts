import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/auth/optionalJwtAuthGuard';

@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly WorkspaceService: WorkspaceService) { }

  @Get('public')
  async getPublicWorkspace(
    @Query('pageNo') pageNo: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.WorkspaceService.getAllPublicWorkspaces(Number(pageNo), Number(pageSize))
  }

  @Post('/public/addUser')
  @UseGuards(JwtAuthGuard)
  async addUserInPublicWorkspace(
    @Body('userId') userId: string
  ) {
    return this.WorkspaceService.addUserInPublicWorkspace(userId)
  }
  @Get('private')
  @UseGuards(JwtAuthGuard)
  async getPrivateWorkspace(
    @Request() req: any,
    @Query('pageNo') pageNo: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.WorkspaceService.getAllPrivateWorkspaces(Number(pageNo), Number(pageSize))
  }
  @Get('private/userWorkspaces')
  @UseGuards(JwtAuthGuard)
  async getUserPrivateWorkspaces(
    @Request() req: any,
    @Query('pageNo') pageNo: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.WorkspaceService.getUserPrivateWorkspaces(req, Number(pageNo), Number(pageSize))
  }

  @Post('private/createWorkspace')
  @UseGuards(JwtAuthGuard)
  async createPrivateWorkspace(
    @Request() req: any,
    @Body('name') name: string,
  ) {
    return this.WorkspaceService.createPrivateWorkspace(req, name)
  }

  @Post('private/addUser')
  @UseGuards(JwtAuthGuard)
  async addUserInPrivateWorkspace(
    @Request() req: any,
    @Body('workspaceId') workspaceId: string,
  ) {
    return this.WorkspaceService.addUserInPrivateWorkspace(req, workspaceId)
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getWorkspaceById(@Request() req: any, @Param('id') id: string) {
    return this.WorkspaceService.getWorkspaceById(req, id);
  }

}
