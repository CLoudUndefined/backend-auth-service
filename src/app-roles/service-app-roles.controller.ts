import { Body, Controller, Delete, Get, NotImplementedException, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { AppRoleResponseDto } from './dto/app-role-response.dto';
import { CreateAppRoleRequestDto } from './dto/create-app-role-request.dto';
import { UpdateAppRoleRequestDto } from './dto/update-app-role-request.dto';
import { MessageResponseDto } from 'src/common/api/dto/message-response.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Service (App Role)')
@ApiBearerAuth('JWT-auth-service')
@Controller('service/apps/:appId/roles')
export class ServiceAppRolesController {
    @Post()
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
        type: AppRoleResponseDto,
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
    async create(
        @Param('appId', ParseIntPipe) appId: number,
        @Body() createDto: CreateAppRoleRequestDto,
    ): Promise<AppRoleResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Get()
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
    async findAll(@Param('appId', ParseIntPipe) appId: number): Promise<AppRoleResponseDto[]> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Get(':roleId')
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
        type: AppRoleResponseDto,
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
        description: 'App or Role not found',
    })
    async findOne(
        @Param('appId', ParseIntPipe) appId: number,
        @Param('roleId', ParseIntPipe) roleId: number,
    ): Promise<AppRoleResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Put(':roleId')
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
        type: AppRoleResponseDto,
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
        description: 'App or Role not found',
    })
    async update(
        @Param('appId', ParseIntPipe) appId: number,
        @Param('roleId', ParseIntPipe) roleId: number,
        @Body() updateDto: UpdateAppRoleRequestDto,
    ): Promise<AppRoleResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Delete(':roleId')
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
        description: 'Role deleted',
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
        description: 'App or Role not found',
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict - Cannot delete role currently assigned to users',
    })
    async remove(
        @Param('appId', ParseIntPipe) appId: number,
        @Param('roleId', ParseIntPipe) roleId: number,
    ): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }
}
