import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAppRequestDto {
    @ApiProperty({
        example: 'My Cat Chat App (renamed)',
        description: 'New name for the application',
        required: false,
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiProperty({
        example: 'Best app for talking about cats (updated description)',
        description: 'New description',
        required: false,
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(1024)
    description?: string;
}
