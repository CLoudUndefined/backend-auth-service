import {
    Body,
    Controller,
    Delete,
    Get,
    NotImplementedException,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { AppUserResponseDto } from './dto/app-user-response.dto';
import { MessageResponseDto } from 'src/common/api/dto/message-response.dto';
import { UpdateAppUserRequestDto } from './dto/update-app-user-request.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppRoleResponseDto } from 'src/app-roles/api/dto/app-role-response.dto';
import { GetAppUsersQueryDto } from './dto/get-app-users-query.dto';
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service-auth.guard';
import { AppUsersService } from '../service/app-users.service';
import { AppUserWithRolesResponseDto } from './dto/app-user-with-roles-response.dto';
import { ServiceUser } from 'src/common/decorators/service-user.decorator';
import { ServiceUserModel } from 'src/database/models/service-user.model';
import { AppUserWithRolesAndPermissionsResponseDto } from './dto/app-user-with-roles-and-permissions.dto';

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

        return { message: 'user deleted successfully' };
    }

    @Get(':userId/roles')
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
        type: AppRoleResponseDto,
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
        @Param('appId', ParseIntPipe) appId: number,
        @Param('userId', ParseIntPipe) userId: number,
    ): Promise<AppRoleResponseDto[]> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post(':userId/roles/:roleId')
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
        @Param('appId', ParseIntPipe) appId: number,
        @Param('userId', ParseIntPipe) userId: number,
        @Param('roleId', ParseIntPipe) roleId: number,
    ): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Delete(':userId/roles/:roleId')
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
        @Param('appId', ParseIntPipe) appId: number,
        @Param('userId', ParseIntPipe) userId: number,
        @Param('roleId', ParseIntPipe) roleId: number,
    ): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }
}
