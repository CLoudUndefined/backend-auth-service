import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAppDto {
    @ApiProperty({
        example: 'My Cat Chat App (renamed)',
        description: 'New name for the application',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiProperty({
        example: 'Best app for talking about cats (updated description)',
        description: 'New description',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;
}
