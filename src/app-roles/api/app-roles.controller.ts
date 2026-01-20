import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { AppRoleResponseDto } from './dto/app-role-response.dto';
import { CreateAppRoleRequestDto } from './dto/create-app-role-request.dto';
import { UpdateAppRoleRequestDto } from './dto/update-app-role-request.dto';
import { MessageResponseDto } from 'src/common/api/dto/message-response.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AppRolesService } from '../service/app-roles.service';
import { JwtAppAuthGuard } from 'src/app-auth/guards/jwt-app-auth.guard';
import { AppPermissionGuard } from 'src/app-auth/guards/app-permissions.guard';
import { AppUser } from 'src/common/decorators/app-user.decorator';
import { type AuthenticatedAppUser } from 'src/app-auth/interfaces/authenticated-app-user.interface';
import { AppRoleWithPermissionsResponseDto } from './dto/app-role-with-permissions-response.dto';
import { Permissions } from 'src/app-auth/decorators/permissions.reflector';
import { AppPermission } from 'src/app-auth/enums/app-permissions.enum';

@ApiTags('App (Role)')
@ApiBearerAuth('JWT-auth-app')
@Controller('app/roles')
export class AppRolesController {
    constructor(private readonly appRolesService: AppRolesService) {}

    @Post()
    @UseGuards(JwtAppAuthGuard, AppPermissionGuard)
    @Permissions(AppPermission.ROLES_READ, AppPermission.ROLES_MANAGE)
    @ApiOperation({
        summary: 'Create a new role in the app',
        description: 'Creates a role definition that can be assigned to app users.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiResponse({
        status: 201,
        description: 'Role created',
        type: AppRoleWithPermissionsResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - requires role management permissions',
    })
    @ApiResponse({
        status: 404,
        description: 'App not found',
    })
    async createRole(
        @AppUser() user: AuthenticatedAppUser,
        @Body() createRoleDto: CreateAppRoleRequestDto,
    ): Promise<AppRoleWithPermissionsResponseDto> {
        const role = await this.appRolesService.createRoleByAppUser(
            user.appId,
            createRoleDto.name,
            createRoleDto.description,
            createRoleDto.permissionIds,
        );
        return new AppRoleWithPermissionsResponseDto(role);
    }

    @Get()
    @UseGuards(JwtAppAuthGuard, AppPermissionGuard)
    @Permissions(AppPermission.ROLES_READ)
    @ApiOperation({
        summary: 'List all roles in the app',
        description: 'Returns all roles defined within the application.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'List of roles',
        type: AppRoleResponseDto,
        isArray: true,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - can only view roles with special permission',
    })
    @ApiResponse({
        status: 404,
        description: 'App not found',
    })
    async getAllRoles(@AppUser() user: AuthenticatedAppUser): Promise<AppRoleResponseDto[]> {
        const roles = await this.appRolesService.getAllRolesByAppUser(user.appId);
        return roles.map((role) => new AppRoleResponseDto(role));
    }

    @Get(':roleId')
    @UseGuards(JwtAppAuthGuard, AppPermissionGuard)
    @Permissions(AppPermission.ROLES_READ)
    @ApiOperation({
        summary: 'Get role details',
        description: 'Returns specific role information.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiParam({
        name: 'roleId',
        example: 2,
    })
    @ApiResponse({
        status: 200,
        description: 'Role details',
        type: AppRoleWithPermissionsResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - can only view roles with special permission',
    })
    @ApiResponse({
        status: 404,
        description: 'App or Role not found',
    })
    async getRole(
        @AppUser() user: AuthenticatedAppUser,
        @Param('roleId', ParseIntPipe) roleId: number,
    ): Promise<AppRoleWithPermissionsResponseDto> {
        const role = await this.appRolesService.getRoleByAppUser(user.appId, roleId);
        return new AppRoleWithPermissionsResponseDto(role);
    }

    @Put(':roleId')
    @UseGuards(JwtAppAuthGuard, AppPermissionGuard)
    @Permissions(AppPermission.ROLES_READ, AppPermission.ROLES_MANAGE)
    @ApiOperation({
        summary: 'Update role',
        description: 'Updates role name or description.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiParam({
        name: 'roleId',
        example: 2,
    })
    @ApiResponse({
        status: 200,
        description: 'Role updated successfully',
        type: AppRoleWithPermissionsResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - requires role management permissions',
    })
    @ApiResponse({
        status: 404,
        description: 'App or Role not found',
    })
    async updateRole(
        @AppUser() user: AuthenticatedAppUser,
        @Param('roleId', ParseIntPipe) roleId: number,
        @Body() updateAppRoleDto: UpdateAppRoleRequestDto,
    ): Promise<AppRoleWithPermissionsResponseDto> {
        const role = await this.appRolesService.updateRoleByAppUser(
            user.appId,
            roleId,
            updateAppRoleDto.name,
            updateAppRoleDto.description,
            updateAppRoleDto.permissionIds,
        );
        return new AppRoleWithPermissionsResponseDto(role);
    }

    @Delete(':roleId')
    @UseGuards(JwtAppAuthGuard, AppPermissionGuard)
    @Permissions(AppPermission.ROLES_READ, AppPermission.ROLES_MANAGE)
    @ApiOperation({
        summary: 'Delete role',
        description: 'Deletes a role. May fail if role is assigned to users.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiParam({
        name: 'roleId',
        example: 2,
    })
    @ApiResponse({
        status: 200,
        description: 'Role deleted successfully',
        type: MessageResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - requires role management permissions',
    })
    @ApiResponse({
        status: 404,
        description: 'App or Role not found',
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict - Cannot delete role currently assigned to users',
    })
    async deleteRole(
        @AppUser() user: AuthenticatedAppUser,
        @Param('roleId', ParseIntPipe) roleId: number,
    ): Promise<MessageResponseDto> {
        await this.appRolesService.deleteRoleByAppUser(user.appId, roleId);
        return { message: 'Role deleted successfully' };
    }
}
