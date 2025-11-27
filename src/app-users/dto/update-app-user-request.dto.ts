import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEmail, IsInt, IsNotEmpty, IsOptional, IsPositive, MaxLength } from 'class-validator';

export class UpdateAppUserRequestDto {
    @ApiProperty({
        example: 'developer@example.com',
        description: 'New email for the user',
        required: false,
    })
    @IsOptional()
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(255)
    email?: string;

    @ApiProperty({
        example: 2,
        description: 'ID of the role to assign to this user.',
        required: false,
    })
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    @IsPositive({ each: true })
    roleIds?: number[];
}
