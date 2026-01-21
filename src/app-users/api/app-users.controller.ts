import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AppUserResponseDto } from './dto/app-user-response.dto';
import { MessageResponseDto } from 'src/common/api/dto/message-response.dto';
import { UpdateAppUserRequestDto } from './dto/update-app-user-request.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetAppUsersQueryDto } from './dto/get-app-users-query.dto';
import { JwtAppAuthGuard } from 'src/app-auth/guards/jwt-app-auth.guard';
import { AppPermissionGuard } from 'src/app-auth/guards/app-permissions.guard';
import { Permissions } from 'src/app-auth/decorators/permissions.reflector';
import { AppUser } from 'src/common/decorators/app-user.decorator';
import { type AuthenticatedAppUser } from 'src/app-auth/interfaces/authenticated-app-user.interface';
import { AppUserWithRolesResponseDto } from './dto/app-user-with-roles-response.dto';
import { AppUsersService } from '../service/app-users.service';
import { AppUserWithRolesAndPermissionsResponseDto } from './dto/app-user-with-roles-and-permissions-response.dto';
import { AppRoleWithPermissionsResponseDto } from 'src/app-roles/api/dto/app-role-with-permissions-response.dto';
import { AppPermission } from 'src/app-auth/enums/app-permissions.enum';

@ApiTags('App (Users)')
@ApiBearerAuth('JWT-auth-app')
@Controller('app/users')
export class AppUsersController {
    constructor(private readonly appUsersService: AppUsersService) {}

    @Get()
    @UseGuards(JwtAppAuthGuard, AppPermissionGuard)
    @Permissions(AppPermission.USERS_READ)
    @ApiOperation({
        summary: 'List users of an application',
        description: 'Retrieves all registered users for the specific application. Optionally filter by role.',
    })
    @ApiQuery({
        name: 'roleId',
        required: false,
        type: Number,
    })
    @ApiResponse({
        status: 200,
        description: 'List of users',
        type: AppUserWithRolesResponseDto,
        isArray: true,
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
        description: 'Forbidden - can only view user with special permission',
    })
    @ApiResponse({
        status: 404,
        description: 'App not found',
    })
    async listAppUsers(
        @AppUser() user: AuthenticatedAppUser,
        @Query() query: GetAppUsersQueryDto,
    ): Promise<AppUserWithRolesResponseDto[]> {
        const appUsers = await this.appUsersService.listAppUsersByAppUser(user.appId, user.id, query.roleId);
        return appUsers.map((appUser) => new AppUserWithRolesResponseDto(appUser));
    }

    @Get(':appUserId')
    @UseGuards(JwtAppAuthGuard, AppPermissionGuard)
    @Permissions(AppPermission.USERS_READ)
    @ApiOperation({
        summary: 'Get specific app user',
        description: 'Returns details of a registered user in the app.',
    })
    @ApiParam({
        name: 'appUserId',
        example: 2,
    })
    @ApiResponse({
        status: 200,
        description: 'User details',
        type: AppUserWithRolesAndPermissionsResponseDto,
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
        description: 'Forbidden - can only view user with special permission',
    })
    @ApiResponse({
        status: 404,
        description: 'App or User not found',
    })
    async getAppUser(
        @AppUser() user: AuthenticatedAppUser,
        @Param('appUserId', ParseIntPipe) appUserId: number,
    ): Promise<AppUserWithRolesAndPermissionsResponseDto> {
        const appUser = await this.appUsersService.getAppUserByAppUser(user.appId, user.id, appUserId);
        return new AppUserWithRolesAndPermissionsResponseDto(appUser);
    }

    @Put(':appUserId')
    @UseGuards(JwtAppAuthGuard, AppPermissionGuard)
    @Permissions(AppPermission.USERS_READ, AppPermission.USERS_MANAGE)
    @ApiOperation({
        summary: 'Update app user',
        description: 'Updates user email.',
    })
    @ApiParam({
        name: 'appUserId',
        example: 2,
    })
    @ApiResponse({
        status: 200,
        description: 'User updated',
        type: AppUserResponseDto,
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
        description: 'Forbidden - can only manage user with special permission',
    })
    @ApiResponse({
        status: 404,
        description: 'App, User or Role not found',
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict - Email already exists',
    })
    async updateAppUser(
        @AppUser() user: AuthenticatedAppUser,
        @Param('appUserId', ParseIntPipe) appUserId: number,
        @Body() updateAppUserDto: UpdateAppUserRequestDto,
    ): Promise<AppUserResponseDto> {
        const appUser = await this.appUsersService.updateAppUserByAppUser(
            user.appId,
            user.id,
            appUserId,
            updateAppUserDto.email,
        );
        return new AppUserResponseDto(appUser);
    }

    @Delete(':appUserId')
    @UseGuards(JwtAppAuthGuard, AppPermissionGuard)
    @Permissions(AppPermission.USERS_READ, AppPermission.USERS_MANAGE)
    @ApiOperation({
        summary: 'Delete app user',
        description: 'Removes a user from the application.',
    })
    @ApiParam({
        name: 'appUserId',
        example: 2,
    })
    @ApiResponse({
        status: 200,
        description: 'User deleted successfully',
        type: MessageResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - can only manage user with special permission',
    })
    @ApiResponse({
        status: 404,
        description: 'App or User not found',
    })
    async deleteAppUser(
        @AppUser() user: AuthenticatedAppUser,
        @Param('appUserId', ParseIntPipe) appUserId: number,
    ): Promise<MessageResponseDto> {
        await this.appUsersService.deleteAppUserByAppUser(user.appId, user.id, appUserId);
        return { message: 'User deleted successfully' };
    }

    @Get(':appUserId/roles')
    @UseGuards(JwtAppAuthGuard, AppPermissionGuard)
    @Permissions(AppPermission.USERS_READ, AppPermission.USERS_MANAGE, AppPermission.ROLES_READ)
    @ApiOperation({
        summary: 'Get user roles',
        description: 'Retrieves all roles assigned to the user.',
    })
    @ApiParam({
        name: 'appUserId',
        example: 2,
    })
    @ApiResponse({
        status: 200,
        description: 'List of assigned roles',
        type: AppRoleWithPermissionsResponseDto,
        isArray: true,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - can only view user with special permission',
    })
    @ApiResponse({
        status: 404,
        description: 'App or User not found',
    })
    async getAppUserRoles(
        @AppUser() user: AuthenticatedAppUser,
        @Param('appUserId', ParseIntPipe) appUserId: number,
    ): Promise<AppRoleWithPermissionsResponseDto[]> {
        const roles = await this.appUsersService.getAppUserRolesByAppUser(user.appId, user.id, appUserId);
        return roles.map((role) => new AppRoleWithPermissionsResponseDto(role));
    }

    @Post(':appUserId/roles/:roleId')
    @UseGuards(JwtAppAuthGuard, AppPermissionGuard)
    @Permissions(
        AppPermission.USERS_READ,
        AppPermission.USERS_MANAGE,
        AppPermission.ROLES_READ,
        AppPermission.ROLES_MANAGE,
    )
    @ApiOperation({
        summary: 'Add role to user',
        description: 'Assigns a specific role to the user.',
    })
    @ApiParam({
        name: 'appUserId',
        example: 2,
    })
    @ApiParam({
        name: 'roleId',
        description: 'Role ID to assign',
        example: 2,
    })
    @ApiResponse({
        status: 201,
        description: 'Role added successfully',
        type: MessageResponseDto,
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
        description: 'Forbidden - can only manage user with special permission',
    })
    @ApiResponse({
        status: 404,
        description: 'App, User, or Role not found',
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict - User already has this role',
    })
    async addRoleToAppUser(
        @AppUser() user: AuthenticatedAppUser,
        @Param('appUserId', ParseIntPipe) appUserId: number,
        @Param('roleId', ParseIntPipe) roleId: number,
    ): Promise<MessageResponseDto> {
        await this.appUsersService.addRoleToAppUserByAppUser(user.appId, user.id, appUserId, roleId);
        return { message: 'Role added successfully' };
    }

    @Delete(':appUserId/roles/:roleId')
    @UseGuards(JwtAppAuthGuard, AppPermissionGuard)
    @Permissions(
        AppPermission.USERS_READ,
        AppPermission.USERS_MANAGE,
        AppPermission.ROLES_READ,
        AppPermission.ROLES_MANAGE,
    )
    @ApiOperation({
        summary: 'Remove role from user',
        description: 'Removes a specific role from the user.',
    })
    @ApiParam({
        name: 'appUserId',
        example: 2,
    })
    @ApiParam({
        name: 'roleId',
        example: 3,
    })
    @ApiResponse({
        status: 200,
        description: 'Role removed successfully',
        type: MessageResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - can only manage user with special permission',
    })
    @ApiResponse({
        status: 404,
        description: 'App, User, Role not found, or User does not have this role',
    })
    async removeRoleFromAppUser(
        @AppUser() user: AuthenticatedAppUser,
        @Param('appUserId', ParseIntPipe) appUserId: number,
        @Param('roleId', ParseIntPipe) roleId: number,
    ): Promise<MessageResponseDto> {
        await this.appUsersService.removeRoleFromAppUserByAppUser(user.appId, user.id, appUserId, roleId);
        return { message: 'Role removed successfully' };
    }
}
