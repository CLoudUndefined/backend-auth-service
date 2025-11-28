import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class RegisterRequestDto {
    @ApiProperty({
        example: 'developer@example.com',
        description: 'Email address for registration. Must be unique.',
    })
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(255)
    email: string;

    @ApiProperty({
        example: 'S@perDuper5ecret_Pa55w0rd2004',
        description: 'Password for the new account. Must be at least 12 characters long.',
        minLength: 12,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(12)
    @MaxLength(255)
    password: string;

    @ApiProperty({
        example: 'What is your pet name?',
        description: 'Security question for password recovery',
        required: false,
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(1024)
    recoveryQuestion?: string;

    @ApiProperty({
        example: 'Domestos',
        description: 'Answer to the security question',
        required: false,
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(1024)
    recoveryAnswer?: string;
}
