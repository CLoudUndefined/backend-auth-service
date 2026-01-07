import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { CreateAppRequestDto } from './dto/create-app-request.dto';
import { AppResponseDto } from './dto/app-response.dto';
import { UpdateAppRequestDto } from './dto/update-app-request.dto';
import { MessageResponseDto } from 'src/common/api/dto/message-response.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAppResponseDto } from './dto/create-app-response.dto';
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service-auth.guard';
import { AppsService } from './apps.service';
import { ServiceUser } from 'src/common/decorators/service-user.decorator';
import { ServiceUserModel } from 'src/database/models/service-user.model';
import { IsGodGuard } from 'src/auth/guards/is-god.guard';

@ApiTags('Service (Apps Management)')
@ApiBearerAuth('JWT-auth-service')
@Controller('service/apps')
export class ServiceAppsController {
    constructor(private readonly appsService: AppsService) {}

    @Post()
    @UseGuards(JwtServiceAuthGuard)
    @ApiOperation({
        summary: 'Create new application',
        description: 'Creates a new application container with its own secret and user base.',
    })
    @ApiResponse({
        status: 201,
        description: 'App created successfully',
        type: AppResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    async createApp(
        @ServiceUser() user: ServiceUserModel,
        @Body() createAppDto: CreateAppRequestDto,
    ): Promise<CreateAppResponseDto> {
        return this.appsService.create(user.id, createAppDto);
    }

    @Get()
    @UseGuards(JwtServiceAuthGuard, IsGodGuard)
    @ApiOperation({
        summary: 'Get all apps (God only)',
        description: 'Returns a list of all applications. Only accessible to users with god-mode privileges',
    })
    @ApiResponse({
        status: 200,
        description: 'List retrieved',
        type: AppResponseDto,
        isArray: true,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    async findAllApps(): Promise<AppResponseDto[]> {
        return this.appsService.findAllApps();
    }

    @Get(':id')
    @UseGuards(JwtServiceAuthGuard)
    @ApiOperation({
        summary: 'Get app by ID',
        description: 'Returns details of a specific application.',
    })
    @ApiParam({
        name: 'id',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'App details found',
        type: AppResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - can only view own apps or requires god-mode',
    })
    @ApiResponse({ status: 404, description: 'App not found' })
    async findAppById(
        @ServiceUser() user: ServiceUserModel,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<AppResponseDto> {
        return this.appsService.findAppById(user.id, user.isGod, id);
    }

    @Put(':id')
    @UseGuards(JwtServiceAuthGuard)
    @ApiOperation({
        summary: 'Update application',
        description: 'Updates name or description of the application.',
    })
    @ApiParam({
        name: 'id',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'App updated',
        type: AppResponseDto,
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
        description: 'App not found',
    })
    async updateApp(
        @ServiceUser() user: ServiceUserModel,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateAppDto: UpdateAppRequestDto,
    ): Promise<AppResponseDto> {
        return this.appsService.update(user.id, user.isGod, id, updateAppDto);
    }

    @Delete(':id')
    @UseGuards(JwtServiceAuthGuard)
    @ApiOperation({
        summary: 'Delete application',
        description: 'Deletes the application and all associated users/roles definitively.',
    })
    @ApiParam({
        name: 'id',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'App deleted',
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
        description: 'App not found',
    })
    async deleteApp(
        @ServiceUser() user: ServiceUserModel,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<MessageResponseDto> {
        await this.appsService.delete(user.id, user.isGod, id);

        return { message: 'Application deleted successfully' };
    }
}
