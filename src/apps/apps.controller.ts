import { Body, Controller, Delete, Get, NotImplementedException, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CreateAppDto } from './dto/create-app.dto';
import { AppResponseDto } from './dto/app-response.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import { MessageResponseDto } from 'src/common/dto/message-response.dto';

@Controller('apps')
export class AppsController {
    @Post()
    async create(@Body() createAppDto: CreateAppDto): Promise<AppResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Get()
    async findAll(): Promise<AppResponseDto[]> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<AppResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateAppDto): Promise<AppResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }
}
