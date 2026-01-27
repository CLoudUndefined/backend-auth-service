import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AppUserResponseDto } from './dto/app-user-response.dto';
import { MessageResponseDto } from 'src/common/api/dto/message-response.dto';
import { UpdateAppUserRequestDto } from './dto/update-app-user-request.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetAppUsersQueryDto } from './dto/get-app-users-query.dto';
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service-auth.guard';
import { AppUsersService } from '../service/app-users.service';
import { AppUserWithRolesResponseDto } from './dto/app-user-with-roles-response.dto';
import { AppUserWithRolesAndPermissionsResponseDto } from './dto/app-user-with-roles-and-permissions-response.dto';
import { AppRoleWithPermissionsResponseDto } from 'src/app-roles/api/rest/dto/app-role-with-permissions-response.dto';
import { AppAccessGuard } from 'src/auth/guards/app-access.guard';

@ApiTags('Service (App Users)')
@ApiBearerAuth('JWT-auth-service')
@Controller('service/apps/:appId/users')
export class ServiceAppUsersController {
    constructor(private readonly appUsersService: AppUsersService) {}

    @Get()
    @UseGuards(JwtServiceAuthGuard, AppAccessGuard)
    @ApiOperation({
        summary: 'List users of an application',
        description: 'Retrieves all registered users for the specific application. Optionally filter by role.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
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
        description: 'Forbidden - can only view own apps or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'App not found',
    })
    async listAppUsers(
        @Param('appId', ParseIntPipe) appId: number,
        @Query() query: GetAppUsersQueryDto,
    ): Promise<AppUserWithRolesResponseDto[]> {
        const appUsers = await this.appUsersService.listAppUsers(appId, query.roleId);
        return appUsers.map((appUser) => {
            return new AppUserWithRolesResponseDto(appUser);
        });
    }

    @Get(':appUserId')
    @UseGuards(JwtServiceAuthGuard, AppAccessGuard)
    @ApiOperation({
        summary: 'Get specific app user',
        description: 'Returns details of a registered user in the app.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
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
        description: 'Forbidden - can only view own apps or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'App or User not found',
    })
    async getAppUser(
        @Param('appId', ParseIntPipe) appId: number,
        @Param('appUserId', ParseIntPipe) appUserId: number,
    ): Promise<AppUserWithRolesAndPermissionsResponseDto> {
        const appUser = await this.appUsersService.getAppUser(appId, appUserId);
        return new AppUserWithRolesAndPermissionsResponseDto(appUser);
    }

    @Put(':appUserId')
    @UseGuards(JwtServiceAuthGuard, AppAccessGuard)
    @ApiOperation({
        summary: 'Update app user',
        description: 'Updates user email.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
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
    async updateAppUser(
        @Param('appId', ParseIntPipe) appId: number,
        @Param('appUserId', ParseIntPipe) appUserId: number,
        @Body() updateAppUserDto: UpdateAppUserRequestDto,
    ): Promise<AppUserResponseDto> {
        const appUser = await this.appUsersService.updateAppUser(appId, appUserId, updateAppUserDto.email);
        return new AppUserResponseDto(appUser);
    }

    @Delete(':appUserId')
    @UseGuards(JwtServiceAuthGuard, AppAccessGuard)
    @ApiOperation({
        summary: 'Delete app user',
        description: 'Removes a user from the application.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
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
        description: 'Forbidden - can only view own apps or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'App or User not found',
    })
    async deleteAppUser(
        @Param('appId', ParseIntPipe) appId: number,
        @Param('appUserId', ParseIntPipe) appUserId: number,
    ): Promise<MessageResponseDto> {
        await this.appUsersService.deleteAppUser(appId, appUserId);
        return { message: 'User deleted successfully' };
    }

    @Get(':appUserId/roles')
    @UseGuards(JwtServiceAuthGuard, AppAccessGuard)
    @ApiOperation({
        summary: 'Get user roles',
        description: 'Retrieves all roles assigned to the user.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
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
        description: 'Forbidden - can only view own apps or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'App or User not found',
    })
    async getAppUserRoles(
        @Param('appId', ParseIntPipe) appId: number,
        @Param('appUserId', ParseIntPipe) appUserId: number,
    ): Promise<AppRoleWithPermissionsResponseDto[]> {
        const roles = await this.appUsersService.getAppUserRoles(appId, appUserId);
        return roles.map((role) => {
            return new AppRoleWithPermissionsResponseDto(role);
        });
    }

    @Post(':appUserId/roles/:roleId')
    @UseGuards(JwtServiceAuthGuard, AppAccessGuard)
    @ApiOperation({
        summary: 'Add role to user',
        description: 'Assigns a specific role to the user.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
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
    async addRoleToAppUser(
        @Param('appId', ParseIntPipe) appId: number,
        @Param('appUserId', ParseIntPipe) appUserId: number,
        @Param('roleId', ParseIntPipe) roleId: number,
    ): Promise<MessageResponseDto> {
        await this.appUsersService.addRoleToAppUser(appId, appUserId, roleId);
        return { message: 'Role added successfully' };
    }

    @Delete(':appUserId/roles/:roleId')
    @UseGuards(JwtServiceAuthGuard, AppAccessGuard)
    @ApiOperation({
        summary: 'Remove role from user',
        description: 'Removes a specific role from the user.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
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
        description: 'Forbidden - can only manage own apps or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'App, User, Role not found, or User does not have this role',
    })
    async removeRoleFromAppUser(
        @Param('appId', ParseIntPipe) appId: number,
        @Param('appUserId', ParseIntPipe) appUserId: number,
        @Param('roleId', ParseIntPipe) roleId: number,
    ): Promise<MessageResponseDto> {
        await this.appUsersService.removeRoleFromAppUser(appId, appUserId, roleId);
        return { message: 'Role removed successfully' };
    }
}
