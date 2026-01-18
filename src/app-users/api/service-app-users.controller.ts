import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AppUserResponseDto } from './dto/app-user-response.dto';
import { MessageResponseDto } from 'src/common/api/dto/message-response.dto';
import { UpdateAppUserRequestDto } from './dto/update-app-user-request.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetAppUsersQueryDto } from './dto/get-app-users-query.dto';
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service-auth.guard';
import { AppUsersService } from '../service/app-users.service';
import { AppUserWithRolesResponseDto } from './dto/app-user-with-roles-response.dto';
import { ServiceUser } from 'src/common/decorators/service-user.decorator';
import { ServiceUserModel } from 'src/database/models/service-user.model';
import { AppUserWithRolesAndPermissionsResponseDto } from './dto/app-user-with-roles-and-permissions-response.dto';
import { AppRoleWithPermissionsResponseDto } from 'src/app-roles/api/dto/app-role-with-permissions-response.dto';

@ApiTags('Service (App Users)')
@ApiBearerAuth('JWT-auth-service')
@Controller('service/apps/:appId/users')
export class ServiceAppUsersController {
    constructor(private readonly appUsersService: AppUsersService) {}

    @Get()
    @UseGuards(JwtServiceAuthGuard)
    @ApiOperation({
        summary: 'List users of an application',
        description: 'Retrieves all registered users for the specific application. Optionally filter by role.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'List of users',
        type: AppUserResponseDto,
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
        description: 'Forbidden - can only view own apps or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'App not found',
    })
    async listUsers(
        @ServiceUser() user: ServiceUserModel,
        @Param('appId', ParseIntPipe) appId: number,
        @Query() query: GetAppUsersQueryDto,
    ): Promise<AppUserWithRolesResponseDto[]> {
        const appUsers = await this.appUsersService.listUsers(appId, user.id, user.isGod, query.roleId);
        return appUsers.map((appUser) => {
            return new AppUserWithRolesResponseDto(appUser);
        });
    }

    @Get(':userId')
    @UseGuards(JwtServiceAuthGuard)
    @ApiOperation({
        summary: 'Get specific app user',
        description: 'Returns details of a registered user in the app.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiParam({
        name: 'userId',
        example: 2,
    })
    @ApiResponse({
        status: 200,
        description: 'User details',
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
        description: 'Forbidden - can only view own apps or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'App or User not found',
    })
    async getProfile(
        @ServiceUser() user: ServiceUserModel,
        @Param('appId', ParseIntPipe) appId: number,
        @Param('userId', ParseIntPipe) userId: number,
    ): Promise<AppUserResponseDto> {
        const appUser = await this.appUsersService.getUser(appId, user.id, user.isGod, userId);
        return new AppUserWithRolesAndPermissionsResponseDto(appUser);
    }

    @Put(':userId')
    @UseGuards(JwtServiceAuthGuard)
    @ApiOperation({
        summary: 'Update app user',
        description: 'Updates user email.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiParam({
        name: 'userId',
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
        description: 'Forbidden - can only view own apps or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'App, User or Role not found',
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict',
    })
    async updateUser(
        @ServiceUser() user: ServiceUserModel,
        @Param('appId', ParseIntPipe) appId: number,
        @Param('userId', ParseIntPipe) userId: number,
        @Body() updateAppUserDto: UpdateAppUserRequestDto,
    ): Promise<AppUserResponseDto> {
        const appUser = await this.appUsersService.updateUser(
            appId,
            user.id,
            user.isGod,
            userId,
            updateAppUserDto.email,
        );
        return new AppUserResponseDto(appUser);
    }

    @Delete(':userId')
    @UseGuards(JwtServiceAuthGuard)
    @ApiOperation({
        summary: 'Delete app user',
        description: 'Removes a user from the application.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiParam({
        name: 'userId',
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
        description: 'Forbidden - can only view own apps or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'App or User not found',
    })
    async deleteUser(
        @ServiceUser() user: ServiceUserModel,
        @Param('appId', ParseIntPipe) appId: number,
        @Param('userId', ParseIntPipe) userId: number,
    ): Promise<MessageResponseDto> {
        await this.appUsersService.deleteUser(appId, user.id, user.isGod, userId);
        return { message: 'User deleted successfully' };
    }

    @Get(':userId/roles')
    @UseGuards(JwtServiceAuthGuard)
    @ApiOperation({
        summary: 'Get user roles',
        description: 'Retrieves all roles assigned to the user.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiParam({
        name: 'userId',
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
        description: 'Forbidden - can only view own apps or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'App or User not found',
    })
    async getUserRoles(
        @ServiceUser() user: ServiceUserModel,
        @Param('appId', ParseIntPipe) appId: number,
        @Param('userId', ParseIntPipe) userId: number,
    ): Promise<AppRoleWithPermissionsResponseDto[]> {
        const roles = await this.appUsersService.getUserRoles(appId, user.id, user.isGod, userId);
        return roles.map((role) => {
            return new AppRoleWithPermissionsResponseDto(role);
        });
    }

    @Post(':userId/roles/:roleId')
    @UseGuards(JwtServiceAuthGuard)
    @ApiOperation({
        summary: 'Add role to user',
        description: 'Assigns a specific role to the user.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiParam({
        name: 'userId',
        example: 2,
    })
    @ApiParam({
        name: 'roleId',
        example: 3,
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
        description: 'Forbidden - can only manage own apps or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'App, User, or Role not found',
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict - User already has this role',
    })
    async addRoleToUser(
        @ServiceUser() user: ServiceUserModel,
        @Param('appId', ParseIntPipe) appId: number,
        @Param('userId', ParseIntPipe) userId: number,
        @Param('roleId', ParseIntPipe) roleId: number,
    ): Promise<MessageResponseDto> {
        await this.appUsersService.addRoleToUser(appId, user.id, user.isGod, userId, roleId);
        return { message: 'Role added successfully' };
    }

    @Delete(':userId/roles/:roleId')
    @UseGuards(JwtServiceAuthGuard)
    @ApiOperation({
        summary: 'Remove role from user',
        description: 'Removes a specific role from the user.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiParam({
        name: 'userId',
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
        description: 'Forbidden - can only manage own apps or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'App, User, Role not found, or User does not have this role',
    })
    async removeRoleFromUser(
        @ServiceUser() user: ServiceUserModel,
        @Param('appId', ParseIntPipe) appId: number,
        @Param('userId', ParseIntPipe) userId: number,
        @Param('roleId', ParseIntPipe) roleId: number,
    ): Promise<MessageResponseDto> {
        await this.appUsersService.removeRoleFromUser(appId, user.id, user.isGod, userId, roleId);
        return { message: 'Role removed successfully' };
    }
}
