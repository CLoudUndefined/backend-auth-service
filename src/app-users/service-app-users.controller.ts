import {
    Body,
    Controller,
    Delete,
    Get,
    NotImplementedException,
    Param,
    ParseIntPipe,
    Put,
    Query,
} from '@nestjs/common';
import { AppUserResponseDto } from './dto/app-user-response.dto';
import { MessageResponseDto } from 'src/common/dto/message-response.dto';
import { UpdateAppUserRequestDto } from './dto/update-app-user-request.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Service (App Users)')
@ApiBearerAuth('JWT-auth-service')
@Controller('service/apps/:appId/users')
export class ServiceAppUsersController {
    @Get()
    @ApiOperation({
        summary: 'List users of an application',
        description: 'Retrieves all registered users for the specific application. Optionally filter by role.',
    })
    @ApiParam({
        name: 'appId',
        description: 'App ID',
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
    async findAll(
        @Param('appId', ParseIntPipe) appId: number,
        @Query() query: GetAppUsersQueryDto,
    ): Promise<AppUserResponseDto[]> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Get(':userId')
    @ApiOperation({
        summary: 'Get specific app user',
        description: 'Returns details of a registered user in the app.',
    })
    @ApiParam({
        name: 'appId',
        description: 'App ID',
        example: 1,
    })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        example: 10,
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
    async findOne(
        @Param('appId', ParseIntPipe) appId: number,
        @Param('userId', ParseIntPipe) userId: number,
    ): Promise<AppUserResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Put(':userId')
    @ApiOperation({
        summary: 'Update app user',
        description: 'Updates user email or assigns a role.',
    })
    @ApiParam({
        name: 'appId',
        description: 'App ID',
        example: 1,
    })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        example: 10,
    })
    @ApiResponse({
        status: 200,
        description: 'User updated',
        type: AppUserResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed (e.g. Invalid Role ID)',
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
        description: 'Conflict - Email already exists',
    })
    async update(
        @Param('appId', ParseIntPipe) appId: number,
        @Param('userId', ParseIntPipe) userId: number,
        @Body() updateDto: UpdateAppUserRequestDto,
    ): Promise<AppUserResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Delete(':userId')
    @ApiOperation({
        summary: 'Delete app user',
        description: 'Removes a user from the application.',
    })
    @ApiParam({
        name: 'appId',
        description: 'App ID',
        example: 1,
    })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        example: 10,
    })
    @ApiResponse({
        status: 200,
        description: 'User deleted',
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
    async remove(
        @Param('appId', ParseIntPipe) appId: number,
        @Param('userId', ParseIntPipe) userId: number,
    ): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }
}
