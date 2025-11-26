import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAppRoleRequestDto {
    @ApiProperty({
        example: 'Senior Manager',
        description: 'New name for the role',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiProperty({
        description: 'New description',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;
}
