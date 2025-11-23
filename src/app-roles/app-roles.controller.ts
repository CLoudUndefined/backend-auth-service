import { Body, Controller, Delete, Get, NotImplementedException, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { AppRoleResponseDto } from './dto/app-role-response.dto';
import { CreateAppRoleDto } from './dto/create-app-role.dto';
import { UpdateAppRoleDto } from './dto/update-app-role.dto';
import { MessageResponseDto } from 'src/common/dto/message-response.dto';

@Controller('apps/:appId/roles')
export class AppRolesController {
    @Post()
    async create(@Param('appId', ParseIntPipe) appId: number, @Body() createDto: CreateAppRoleDto): Promise<AppRoleResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Get()
    async findAll(@Param('appId', ParseIntPipe) appId: number): Promise<AppRoleResponseDto[]> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Get(':roleId')
    async findOne(@Param('appId', ParseIntPipe) appId: number, @Param('roleId', ParseIntPipe) roleId: number): Promise<AppRoleResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Put(':roleId')
    async update(@Param('appId', ParseIntPipe) appId: number, @Param('roleId', ParseIntPipe) roleId: number, @Body() updateDto: UpdateAppRoleDto): Promise<AppRoleResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Delete(':roleId')
    async remove(@Param('appId', ParseIntPipe) appId: number, @Param('roleId', ParseIntPipe) roleId: number): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }
}
