import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { CreateAppRequestDto } from './dto/create-app-request.dto';
import { AppResponseDto } from './dto/app-response.dto';
import { UpdateAppRequestDto } from './dto/update-app-request.dto';
import { MessageResponseDto } from 'src/common/api/dto/message-response.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service-auth.guard';
import { AppsService } from '../service/apps.service';
import { ServiceUser } from 'src/common/decorators/service-user.decorator';
import { IsGodGuard } from 'src/auth/guards/is-god.guard';
import { type AuthenticatedServiceUser } from 'src/auth/interfaces/authenticated-service-user.interface';
import { AppAccessGuard } from 'src/auth/guards/app-access.guard';

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
        description: 'Application created successfully',
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
        @ServiceUser() user: AuthenticatedServiceUser,
        @Body() createAppDto: CreateAppRequestDto,
    ): Promise<AppResponseDto> {
        const app = await this.appsService.createApp(user.id, createAppDto.name, createAppDto.description);
        return new AppResponseDto(app);
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
        const apps = await this.appsService.findAllApps();
        return apps.map((app) => {
            return new AppResponseDto(app);
        });
    }

    @Get(':appId')
    @UseGuards(JwtServiceAuthGuard, AppAccessGuard)
    @ApiOperation({
        summary: 'Get app by ID',
        description: 'Returns details of a specific application.',
    })
    @ApiResponse({
        status: 200,
        description: 'Application details found',
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
    @ApiResponse({ status: 404, description: 'Application not found' })
    async findAppById(@Param('appId', ParseIntPipe) appId: number): Promise<AppResponseDto> {
        const app = await this.appsService.findAppById(appId);
        return new AppResponseDto(app);
    }

    @Put(':appId')
    @UseGuards(JwtServiceAuthGuard, AppAccessGuard)
    @ApiOperation({
        summary: 'Update application',
        description: 'Updates name or description of the application.',
    })
    @ApiResponse({
        status: 200,
        description: 'Application updated',
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
        description: 'Application not found',
    })
    async updateApp(
        @Param('appId', ParseIntPipe) appId: number,
        @Body() updateAppDto: UpdateAppRequestDto,
    ): Promise<AppResponseDto> {
        const app = await this.appsService.updateApp(appId, updateAppDto.name, updateAppDto.description);
        return new AppResponseDto(app);
    }

    @Delete(':appId')
    @UseGuards(JwtServiceAuthGuard, AppAccessGuard)
    @ApiOperation({
        summary: 'Delete application',
        description: 'Deletes the application and all associated users/roles definitively.',
    })
    @ApiResponse({
        status: 200,
        description: 'Application deleted',
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
        description: 'Application not found',
    })
    async deleteApp(@Param('appId', ParseIntPipe) appId: number): Promise<MessageResponseDto> {
        await this.appsService.deleteApp(appId);
        return { message: 'Applicationication deleted successfully' };
    }

    @Post(':appId/regenerate')
    @HttpCode(200)
    @UseGuards(JwtServiceAuthGuard, AppAccessGuard)
    @ApiOperation({
        summary: 'Regenerate application secret',
        description: 'Generates a new JWT secret for the application. ALL existing tokens will be invalidated.',
    })
    @ApiResponse({
        status: 200,
        description: 'Application secret regenerated successfully',
        type: MessageResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - only app owner or god',
    })
    @ApiResponse({
        status: 404,
        description: 'Application not found',
    })
    async regenerateSecret(@Param('appId', ParseIntPipe) appId: number): Promise<MessageResponseDto> {
        await this.appsService.regenerateSecret(appId);
        return { message: 'Application secret regenerated successfully' };
    }
}
