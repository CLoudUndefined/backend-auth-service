import { Controller, NotImplementedException, Get, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { UpdateServiceUserRequestDto } from './dto/update-service-user-request';
import { ServiceUserResponseDto } from './dto/service-user-response.dto';
import { MessageResponseDto } from 'src/common/dto/message-response.dto';
import { AppResponseDto } from 'src/apps/dto/app-response.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Service Users')
@ApiBearerAuth('JWT-auth')
@Controller('service-users')
export class ServiceUsersController {
    @Get('me')
    @ApiOperation({
        summary: 'Get current service user profile',
        description: 'Returns the profile of the authenticated service user',
    })
    @ApiResponse({
        status: 200,
        description: 'User profile retrieved successfully',
        type: ServiceUserResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    async findMe(): Promise<ServiceUserResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Put('me')
    @ApiOperation({
        summary: 'Update current service user profile',
        description: 'Allows authenticated service user to update their own email',
    })
    @ApiResponse({
        status: 200,
        description: 'Profile updated successfully',
        type: ServiceUserResponseDto,
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
        status: 409,
        description: 'Email already exists',
    })
    async update(@Body() updateDto: UpdateServiceUserRequestDto): Promise<ServiceUserResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Get()
    @ApiOperation({
        summary: 'Get all service users (God only)',
        description: 'Returns list of all service users. Only accessible to users with god-mode privileges',
    })
    @ApiResponse({
        status: 200,
        description: 'List of service users',
        type: ServiceUserResponseDto,
        isArray: true,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - god-mode privileges required',
    })
    async findAll(): Promise<ServiceUserResponseDto[]> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get service user by ID',
        description: 'Returns a specific service user. Accessible by the service user themselves or god-mode users',
    })
    @ApiParam({
        name: 'id',
        description: 'Service user ID',
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Service user found',
        type: ServiceUserResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - can only view own profile or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'Service user not found',
    })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<ServiceUserResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete service user',
        description: 'Deletes a service user account. Accessible by the service user themselves or god-mode users',
    })
    @ApiParam({
        name: 'id',
        description: 'Service user ID to delete',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Service user deleted successfully',
        type: MessageResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - can only delete own account or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'Service user not found',
    })
    @ApiResponse({
        status: 409,
        description: 'Cannot delete service user with existing apps',
    })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Get(':id/apps')
    @ApiOperation({
        summary: 'Get applications owned by user',
        description: 'Returns all applications created by a specific service user',
    })
    @ApiParam({
        name: 'id',
        description: 'Service user ID',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'List of service user applications',
        type: AppResponseDto,
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
        description: 'Service user not found',
    })
    async findAllByUser(@Param('id', ParseIntPipe) id: number): Promise<AppResponseDto[]> {
        throw new NotImplementedException('Logic not implemented yet');
    }
}
