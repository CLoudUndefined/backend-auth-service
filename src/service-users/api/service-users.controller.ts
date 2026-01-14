import { Controller, Get, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UpdateServiceUserRequestDto } from './dto/update-service-user-request.dto';
import { ServiceUserResponseDto } from './dto/service-user-response.dto';
import { MessageResponseDto } from 'src/common/api/dto/message-response.dto';
import { AppResponseDto } from 'src/apps/dto/app-response.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service-auth.guard';
import { ServiceUsersService } from '../service/service-users.service';
import { ServiceUser } from 'src/common/decorators/service-user.decorator';
import { ServiceUserModel } from 'src/database/models/service-user.model';
import { IsGodGuard } from 'src/auth/guards/is-god.guard';
import { IsSelfOrGodGuard } from 'src/auth/guards/is-self-or-god.guard';

@ApiTags('Service (Users)')
@ApiBearerAuth('JWT-auth-service')
@Controller('service/users')
export class ServiceUsersController {
    constructor(private readonly serviceUsersService: ServiceUsersService) {}

    @Get('me')
    @UseGuards(JwtServiceAuthGuard)
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
    async getProfile(@ServiceUser() user: ServiceUserModel): Promise<ServiceUserResponseDto> {
        const result = await this.serviceUsersService.findByIdOrThrow(user.id);
        return new ServiceUserResponseDto(result);
    }

    @Put('me')
    @UseGuards(JwtServiceAuthGuard)
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
    async updateProfile(
        @ServiceUser() user: ServiceUserModel,
        @Body() updateProfileDto: UpdateServiceUserRequestDto,
    ): Promise<ServiceUserResponseDto> {
        const result = await this.serviceUsersService.update(user.id, updateProfileDto.email);
        return new ServiceUserResponseDto(result);
    }

    @Get()
    @UseGuards(JwtServiceAuthGuard, IsGodGuard)
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
        const result = await this.serviceUsersService.findAll();
        return result.map((user) => {
            return new ServiceUserResponseDto(user);
        });
    }

    @Get(':id')
    @UseGuards(JwtServiceAuthGuard, IsSelfOrGodGuard)
    @ApiOperation({
        summary: 'Get service user by ID',
        description: 'Returns a specific service user. Accessible by the service user themselves or god-mode users',
    })
    @ApiParam({
        name: 'id',
        example: 1,
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
    async getUser(@Param('id', ParseIntPipe) id: number): Promise<ServiceUserResponseDto> {
        const result = await this.serviceUsersService.findByIdOrThrow(id);
        return new ServiceUserResponseDto(result);
    }

    @Delete(':id')
    @UseGuards(JwtServiceAuthGuard, IsSelfOrGodGuard)
    @ApiOperation({
        summary: 'Delete service user',
        description: 'Deletes a service user account. Accessible by the service user themselves or god-mode users',
    })
    @ApiParam({
        name: 'id',
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
    async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<MessageResponseDto> {
        await this.serviceUsersService.delete(id);

        return { message: 'Service user deleted successfully' };
    }

    @Get(':id/apps')
    @UseGuards(JwtServiceAuthGuard, IsSelfOrGodGuard)
    @ApiOperation({
        summary: 'Get applications owned by user',
        description: 'Returns all applications created by a specific service user',
    })
    @ApiParam({
        name: 'id',
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
    async findAllAppsByOwner(@Param('id', ParseIntPipe) id: number): Promise<AppResponseDto[]> {
        const result = await this.serviceUsersService.findAllAppsByOwnerId(id);
        return result.map((app) => {
            return new AppResponseDto(app);
        });
    }
}
