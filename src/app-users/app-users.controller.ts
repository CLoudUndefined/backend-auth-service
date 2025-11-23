import { Body, Controller, Delete, Get, NotImplementedException, Param, ParseIntPipe, Put } from '@nestjs/common';
import { AppUserResponseDto } from './dto/app-user-response.dto';
import { MessageResponseDto } from 'src/common/dto/message-response.dto';
import { UpdateAppUserDto } from './dto/update-app-user.dto';

@Controller('apps/:appId/users')
export class AppUsersController {
    @Get()
    async findAll(@Param('appId', ParseIntPipe) appId: number): Promise<AppUserResponseDto[]> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Get(':userId')
    async findOne(@Param('appId', ParseIntPipe) appId: number, @Param('userId', ParseIntPipe) userId: number): Promise<AppUserResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Put(':userId')
    async update(@Param('appId', ParseIntPipe) appId: number, @Param('userId', ParseIntPipe) userId: number, @Body() updateDto: UpdateAppUserDto): Promise<AppUserResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Delete(':userId')
    async remove(@Param('appId', ParseIntPipe) appId: number, @Param('userId', ParseIntPipe) userId: number): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }
}
