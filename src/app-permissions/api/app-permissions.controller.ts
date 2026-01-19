import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppPermissionsService } from '../service/app-permissions.service';
import { JwtAppAuthGuard } from 'src/app-auth/guards/jwt-app-auth.guard';

@ApiTags('App (Role Permission)')
@ApiBearerAuth('JWT-auth-app')
@Controller('app/permissions')
export class AppPermissionsController {
    constructor(private readonly appPermissionsService: AppPermissionsService) {}

    @Get()
    @UseGuards(JwtAppAuthGuard)
    @ApiOperation({
        summary: 'List all available system permissions',
        description: 'Returns a dictionary of all permissions that can be assigned to roles.',
    })
    @ApiResponse({
        status: 200,
        description: 'List of system permissions',
        type: PermissionResponseDto,
        isArray: true,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    async getAllPermissions(): Promise<PermissionResponseDto[]> {
        const permissions = await this.appPermissionsService.getAllPermissions();
        return permissions.map((permission) => new PermissionResponseDto(permission));
    }

    @Get(':permissionId')
    @UseGuards(JwtAppAuthGuard)
    @ApiOperation({
        summary: 'Get permission details',
        description: 'Returns details of a specific system permission.',
    })
    @ApiParam({
        name: 'permissionId',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Permission details',
        type: PermissionResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 404,
        description: 'Permission not found',
    })
    async getPermission(@Param('permissionId', ParseIntPipe) permissionId: number): Promise<PermissionResponseDto> {
        const permission = await this.appPermissionsService.getPermission(permissionId);
        return new PermissionResponseDto(permission);
    }
}
