import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
    @ApiProperty({
        example: 'developer@example.com',
        description: 'Email address for registration. Must be unique.',
    })
    @IsEmail({}, { message: 'Email must be valid' })
    @IsNotEmpty({ message: 'Email is required' })
    @MaxLength(255, { message: 'Email must not exceed 255 characters' })
    email: string;

    @ApiProperty({
        example: 'S@perDuper5ecret_Pa55w0rd2004',
        description: 'Password for the new account. Must be at least 12 characters long.',
        minLength: 12
    })
    @IsNotEmpty({ message: 'Password is required' })
    @IsString()
    @MinLength(12, { message: 'Password must be at least 12 characters long' })
    @MaxLength(255, { message: 'Password must not exceed 255 characters' })
    password: string;

    @ApiProperty({
        example: 'What is your pet name?',
        description: 'Security question for password recovery',
        required: false,
    })
    @IsOptional()
    @IsString()
    recoveryQuestion?: string;

    @ApiProperty({
        example: 'Domestos',
        description: 'Answer to the security question',
        required: false,
    })
    @IsOptional()
    @IsString()
    recoveryAnswer?: string;
}