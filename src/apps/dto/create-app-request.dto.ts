import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAppRequestDto {
    @ApiProperty({
        example: 'My Cat Chat App',
        description: 'Name of the application. Must be unique per user.',
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name: string;

    @ApiProperty({
        example: 'Best app for talking about cats',
        description: 'Optional description of the application',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;
}
