import { Body, Controller, Delete, Get, NotImplementedException, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CreateAppDto } from './dto/create-app.dto';
import { AppResponseDto } from './dto/app-response.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import { MessageResponseDto } from 'src/common/dto/message-response.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Apps (Service Management)')
@ApiBearerAuth('JWT-auth')
@Controller('apps')
export class AppsController {
    @Post()
    @ApiOperation({
        summary: 'Create new application',
        description: 'Creates a new application container with its own secret and user base.',
    })
    @ApiResponse({
        status: 201,
        description: 'App created successfully',
        type: AppResponseDto
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    async create(@Body() createAppDto: CreateAppDto): Promise<AppResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Get()
    @ApiOperation({
        summary: 'Get all apps (God only)',
        description: 'Returns a list of all applications. Only accessible to users with god-mode privileges'
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
    async findAll(): Promise<AppResponseDto[]> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get app by ID',
        description: 'Returns details of a specific application.',
    })
    @ApiParam({
        name: 'id',
        description: 'App ID',
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
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<AppResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Update application',
        description: 'Updates name or description of the application.',
    })
    @ApiParam({
        name: 'id',
        description: 'App ID',
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
        description: 'Forbidden - can only view own apps or requires god-mode',
    })
    @ApiResponse({
        status: 404,
        description: 'App not found',
    })
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateAppDto): Promise<AppResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete application',
        description: 'Deletes the application and all associated users/roles definitively.',
    })
    @ApiParam({
        name: 'id',
        description: 'App ID',
        example: 1 })
    @ApiResponse({
        status: 200,
        description: 'App deleted',
        type: MessageResponseDto
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - can only view own apps or requires god-mode'
    })
    @ApiResponse({
        status: 404,
        description: 'App not found'
    })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }
}
