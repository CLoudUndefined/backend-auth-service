import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAppRoleRequestDto {
    @ApiProperty({
        example: 'Senior Manager',
        description: 'New name for the role',
        required: false,
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiProperty({
        description: 'New description',
        required: false,
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(1024)
    description?: string;
}
