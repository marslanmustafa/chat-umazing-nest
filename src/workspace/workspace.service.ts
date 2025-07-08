import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Workspace } from './models/workspace.model';
import { User } from 'src/user/user.model';
import { failure, success } from 'src/utils/response.helper';
import { WorkspaceMember } from './models/workspaceMemeber.model';
import * as crypto from 'crypto'

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectModel(Workspace) private workspaceModel: typeof Workspace,
    @InjectModel(WorkspaceMember) private workspaceMemberModel: typeof WorkspaceMember,
    @InjectModel(User) private userModel: typeof User,
  ) { }

  async getAllPublicWorkspaces(pageNo?: number, pageSize?: number) {
    try {
      const where = { type: 'public' };

      const totalCount = await this.workspaceModel.count({ where });

      const queryOptions: any = {
        where,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email', 'imageUrl'],
          },
          {
            model: WorkspaceMember,
            as: 'members',
            include: [
              {
                model: User,
                as: 'member',
                attributes: ['id', 'name', 'email', 'imageUrl'],
              },
            ],
          },
        ],
      };

      if (pageNo && pageSize) {
        queryOptions.limit = pageSize;
        queryOptions.offset = (pageNo - 1) * pageSize;
      }

      const publicWorkspaces = await this.workspaceModel.findAll(queryOptions);

      return success(
        'Public Workspaces fetched successfully',
        publicWorkspaces,
        {
          totals: totalCount,
          ...(pageNo && pageSize
            ? { pageNo, pageSize }
            : {}),
        }
      );
    } catch (error) {
      return failure(error.message || 'Failed to fetch public workspaces');
    }
  }

  async addUserInPublicWorkspace(userId: string) {
    console.log(userId)
    try {
      let workspaceId: string;

      const publicWorkspace = await this.workspaceModel.findOne({
        where: { type: 'public' },
      });

      if (!publicWorkspace) {
        const newPublicWorkspace = await this.workspaceModel.create({
          id: crypto.randomBytes(16).toString("hex"),
          name: 'Public Workspace',
          type: 'public',
          createdBy: userId,
        });
        workspaceId = newPublicWorkspace.id;
      } else {
        workspaceId = publicWorkspace.id;
      }

      const existingMember = await this.workspaceMemberModel.findOne({
        where: {
          workspaceId,
          userId,
        },
      });

      if (existingMember) {
        return failure('User is already a member of the public workspace');
      }

      await this.workspaceMemberModel.create({
        id: crypto.randomBytes(16).toString("hex"),
        workspaceId,
        userId,
        role: 'member',
      });

      return success('User added to public workspace successfully');
    } catch (error) {
      return failure(error.message || 'Failed to add user to public workspace');
    }
  }

  async getAllPrivateWorkspaces(pageNo?: number, pageSize?: number) {
    try {
      const where = { type: 'private' };

      const totalCount = await this.workspaceModel.count({ where });

      const queryOptions: any = {
        where,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email', 'imageUrl'],
          },
          {
            model: WorkspaceMember,
            as: 'members',
            include: [
              {
                model: User,
                as: 'member',
                attributes: ['id', 'name', 'email', 'imageUrl'],
              },
            ],
          },
        ],
      };

      if (pageNo && pageSize) {
        queryOptions.limit = pageSize;
        queryOptions.offset = (pageNo - 1) * pageSize;
      }

      const publicWorkspaces = await this.workspaceModel.findAll(queryOptions);

      return success(
        'Private Workspaces fetched successfully',
        publicWorkspaces,
        {
          totals: totalCount,
          ...(pageNo && pageSize
            ? { pageNo, pageSize }
            : {}),
        }
      );
    } catch (error) {
      return failure(error.message || 'Failed to fetch private workspaces');
    }
  }

  async getUserPrivateWorkspaces(req: any, pageNo?: number, pageSize?: number) {
    const userId = req.user.id
    try {
      const where = { type: 'private' };

      const totalCount = await this.workspaceModel.count({ where });

      const queryOptions: any = {
        where,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email', 'imageUrl'],
          },
          {
            model: WorkspaceMember,
            as: 'members',
            where: { userId },
            include: [
              {
                model: User,
                as: 'member',
                attributes: ['id', 'name', 'email', 'imageUrl'],
              },
            ],
          },
        ],
      };

      if (pageNo && pageSize) {
        queryOptions.limit = pageSize;
        queryOptions.offset = (pageNo - 1) * pageSize;
      }

      const publicWorkspaces = await this.workspaceModel.findAll(queryOptions);

      return success(
        'Private Workspaces fetched successfully',
        publicWorkspaces,
        {
          totals: totalCount,
          ...(pageNo && pageSize
            ? { pageNo, pageSize }
            : {}),
        }
      );
    } catch (error) {
      return failure(error.message || 'Failed to fetch private workspaces');
    }
  }

  async createPrivateWorkspace(req: any, name: string) {
    const userId = req.user.id
    try {
      const newWorkspace = await this.workspaceModel.create({
        id: crypto.randomBytes(16).toString("hex"),
        name,
        type: 'private',
        createdBy: userId,
      });

      return success('Private workspace created successfully', newWorkspace);
    } catch (error) {
      return failure(error.message || 'Failed to create private workspace');
    }
  }

  async addUserInPrivateWorkspace(req: any, workspaceId: string) {
    const userId = req.user.id;
    try {
      const privateWorkspace = await this.workspaceModel.findOne({
        where: { type: 'private', id: workspaceId },
      });

      if (!privateWorkspace) {
        return failure('Private workspace not found');
      }

      const existingMember = await this.workspaceMemberModel.findOne({
        where: {
          workspaceId,
          userId,
        },
      });

      if (existingMember) {
        return failure('User is already a member of the private workspace');
      }

      const newMember = await this.workspaceMemberModel.create({
        id: crypto.randomBytes(16).toString("hex"),
        workspaceId,
        userId,
        role: 'member',
      });

      return success(
        'User added to private workspace successfully',
        newMember
      );
    } catch (error) {
      return failure(error.message || 'Failed to add user to private workspace');
    }
  }

  async getWorkspaceById(req: any, id: string) {
    const userId = req?.user?.id ?? null;

    const singleWorkspace = await this.workspaceModel.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'imageUrl'],
        },
        {
          model: WorkspaceMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'member',
              attributes: ['id', 'name', 'email', 'imageUrl'],
            },
          ],
        },
      ],
    });

    if (!singleWorkspace) {
      return failure('Workspace not found');
    }

    let isMember = false;
    const plainWorkspace = singleWorkspace.toJSON();
    if (userId && plainWorkspace.members) {
      console.log(plainWorkspace.members)
      isMember = plainWorkspace.members.some(
        (m) => m.userId === userId,
      );
    }

    return success('Workspace fetched successfully', {
      workspace: singleWorkspace,
      isMember: userId ? isMember : undefined, 
    });
  }

}
