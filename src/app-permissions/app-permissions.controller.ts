import { Controller, Get, NotImplementedException, Param, ParseIntPipe } from '@nestjs/common';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('App (Role Permission)')
@Controller('apps/permissions')
export class AppPermissionsController {
    @Get()
    @ApiOperation({
        summary: 'List all available system permissions',
        description: 'Returns a dictionary of all permissions that can be assigned to roles.',
    })
    @ApiResponse({
        status: 200,
        description: 'List of system permissions',
        type: PermissionResponseDto,
        isArray: true
    })
    async findAll(): Promise<PermissionResponseDto[]> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Get(':permissionId')
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
        status: 404,
        description: 'Permission not found'
    })
    async findOne(
        @Param('permissionId', ParseIntPipe) permissionId: number,
    ): Promise<PermissionResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }
}
