import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { AppRoleResponseDto } from './dto/app-role-response.dto';
import { CreateAppRoleRequestDto } from './dto/create-app-role-request.dto';
import { UpdateAppRoleRequestDto } from './dto/update-app-role-request.dto';
import { MessageResponseDto } from 'src/common/api/dto/message-response.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AppRolesService } from '../service/app-roles.service';
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service-auth.guard';
import { AppRoleWithPermissionsResponseDto } from './dto/app-role-with-permissions-response.dto';
import { AppAccessGuard } from 'src/auth/guards/app-access.guard';

@ApiTags('Service (App Role)')
@ApiBearerAuth('JWT-auth-service')
@Controller('service/apps/:appId/roles')
export class ServiceAppRolesController {
    constructor(private readonly appRolesService: AppRolesService) {}

    @Post()
    @UseGuards(JwtServiceAuthGuard, AppAccessGuard)
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
        description: 'Forbidden - can only manage roles for own apps or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'App not found',
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict',
    })
    async createRole(
        @Param('appId', ParseIntPipe) appId: number,
        @Body() createAppRoleDto: CreateAppRoleRequestDto,
    ): Promise<AppRoleWithPermissionsResponseDto> {
        const role = await this.appRolesService.createRole(
            appId,
            createAppRoleDto.name,
            createAppRoleDto.description,
            createAppRoleDto.permissionIds,
        );
        return new AppRoleWithPermissionsResponseDto(role);
    }

    @Get()
    @UseGuards(JwtServiceAuthGuard, AppAccessGuard)
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
        description: 'Forbidden - can only view own apps or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'App not found',
    })
    async getAllRoles(@Param('appId', ParseIntPipe) appId: number): Promise<AppRoleResponseDto[]> {
        const roles = await this.appRolesService.getAllRoles(appId);
        return roles.map((role) => {
            return new AppRoleResponseDto(role);
        });
    }

    @Get(':roleId')
    @UseGuards(JwtServiceAuthGuard, AppAccessGuard)
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
        description: 'Forbidden - can only view own apps or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'App or role not found',
    })
    async getRole(
        @Param('appId', ParseIntPipe) appId: number,
        @Param('roleId', ParseIntPipe) roleId: number,
    ): Promise<AppRoleWithPermissionsResponseDto> {
        const role = await this.appRolesService.getRole(appId, roleId);
        return new AppRoleWithPermissionsResponseDto(role);
    }

    @Put(':roleId')
    @UseGuards(JwtServiceAuthGuard, AppAccessGuard)
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
        description: 'Role updated',
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
        description: 'Forbidden - can only manage roles for own apps or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'App or role not found',
    })
    async updateRole(
        @Param('appId', ParseIntPipe) appId: number,
        @Param('roleId', ParseIntPipe) roleId: number,
        @Body() updateAppRoleDto: UpdateAppRoleRequestDto,
    ): Promise<AppRoleWithPermissionsResponseDto> {
        const role = await this.appRolesService.updateRole(
            appId,
            roleId,
            updateAppRoleDto.name,
            updateAppRoleDto.description,
            updateAppRoleDto.permissionIds,
        );
        return new AppRoleWithPermissionsResponseDto(role);
    }

    @Delete(':roleId')
    @UseGuards(JwtServiceAuthGuard, AppAccessGuard)
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
        description: 'Forbidden - can only manage roles for own apps or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'App or role not found',
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict',
    })
    async deleteRole(
        @Param('appId', ParseIntPipe) appId: number,
        @Param('roleId', ParseIntPipe) roleId: number,
    ): Promise<MessageResponseDto> {
        await this.appRolesService.deleteRole(appId, roleId);
        return { message: 'Role deleted successfully' };
    }
}
