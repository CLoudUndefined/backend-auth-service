import { Controller, NotImplementedException, Get, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { UpdateServiceUserRequestDto } from './dto/update-service-user-request';
import { ServiceUserResponseDto } from './dto/service-user-response.dto';
import { DeleteServiceUserResponseDto } from './dto/delete-service-user-response.dto';

@Controller('service-users')
export class ServiceUsersController {
    @Get('me')
    async findMe(): Promise<ServiceUserResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Put('me')
    async update(@Body() updateDto: UpdateServiceUserRequestDto): Promise<ServiceUserResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Get()
    async findAll(): Promise<ServiceUserResponseDto[]> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteServiceUserResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }
}
