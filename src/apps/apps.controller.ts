import { Body, Controller, Get, NotImplementedException, Put } from '@nestjs/common';
import { AppResponseDto } from './dto/app-response.dto';
import { UpdateAppRequestDto } from './dto/update-app-request.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Apps (Management)')
@ApiBearerAuth('JWT-auth-service')
@Controller('apps/:appId')
export class AppsController {
    @Get()
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
    async findOne(): Promise<AppResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Put()
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
    async update(@Body() updateDto: UpdateAppRequestDto): Promise<AppResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }
}
