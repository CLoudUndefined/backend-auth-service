import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class UpdateAppUserDto {
    @ApiProperty({
        example: 'developer@example.com',
        description: 'New email for the user',
        required: false,
    })
    @IsEmail({}, { message: 'Email must be valid' })
    @IsOptional()
    @MaxLength(255, { message: 'Email must not exceed 255 characters' })
    email?: string;

    @ApiProperty({
        example: 2,
        description: 'ID of the role to assign to this user.',
        required: false,
    })
    @IsOptional()
    @IsInt()
    roleId?: number;
}
