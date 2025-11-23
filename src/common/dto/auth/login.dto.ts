import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        example: 'developer@example.com',
        description: 'Registered email address of the user'
    })
    @IsEmail({}, { message: 'Email must be valid' })
    @IsNotEmpty({ message: 'Email is required' })
    @MaxLength(255, { message: 'Email must not exceed 255 characters' })
    email: string;

    @ApiProperty({
        example: 'S@perDuper5ecret_Pa55w0rd2004',
        description: 'User password'
    })
    @IsNotEmpty({ message: 'Password is required' })
    @IsString()
    @MinLength(12, { message: 'Password must be at least 12 characters long' })
    @MaxLength(255, { message: 'Password must not exceed 255 characters' })
    password: string;
}