import { Body, Controller, Get, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { AppResponseDto } from './dto/app-response.dto';
import { UpdateAppRequestDto } from './dto/update-app-request.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppsService } from '../service/apps.service';
import { JwtAppAuthGuard } from 'src/app-auth/guards/jwt-app-auth.guard';
import { AppUser } from 'src/common/decorators/app-user.decorator';
import { type AuthenticatedAppUser } from 'src/app-auth/interfaces/authenticated-app-user.interface';
import { AppPermissionGuard } from 'src/app-auth/guards/app-permissions.guard';
import { Permissions } from 'src/app-auth/decorators/permissions.reflector';

@ApiTags('Apps (Management)')
@ApiBearerAuth('JWT-auth-app')
@Controller('apps/:appId')
export class AppsController {
    constructor(private readonly appsService: AppsService) {}

    @Get()
    @UseGuards(JwtAppAuthGuard, AppPermissionGuard)
    @Permissions('app.manage')
    @ApiOperation({
        summary: 'Get current app info',
        description: 'Returns public details about the application context.',
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
        status: 404,
        description: 'App not found',
    })
    async getApp(
        @AppUser() user: AuthenticatedAppUser,
        @Param('appId', ParseIntPipe) appId: number,
    ): Promise<AppResponseDto> {
        const app = await this.appsService.findAppByIdByAppUser(appId, user.id);
        return new AppResponseDto(app);
    }

    @Put()
    @UseGuards(JwtAppAuthGuard, AppPermissionGuard)
    @Permissions('app.manage')
    @ApiOperation({
        summary: 'Update application',
        description: 'Updates name or description of the application.',
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
        status: 404,
        description: 'App not found',
    })
    async updateApp(
        @AppUser() user: AuthenticatedAppUser,
        @Param('appId', ParseIntPipe) appId: number,
        @Body() updateAppDto: UpdateAppRequestDto,
    ): Promise<AppResponseDto> {
        const app = await this.appsService.updateByAppUser(appId, user.id, updateAppDto.name, updateAppDto.description);
        return new AppResponseDto(app);
    }
}
