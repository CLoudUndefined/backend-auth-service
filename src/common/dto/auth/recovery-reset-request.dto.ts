import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RecoveryResetRequestDto {
    @ApiProperty({
        example: 'developer@example.com',
        description: 'Email address of the user resetting the password',
    })
    @IsNotEmpty({ message: 'Email is required' })
    @MaxLength(255, { message: 'Email must not exceed 255 characters' })
    email: string;

    @ApiProperty({
        example: 'Smith',
        description: 'Answer to the security question',
    })
    @IsNotEmpty()
    @IsString()
    answer: string;

    @ApiProperty({
        example: 'MegaPa55w0rd2008_AlEx',
        description: 'New password to be set',
        minLength: 12,
    })
    @IsNotEmpty({ message: 'Password is required' })
    @IsString()
    @MinLength(12, { message: 'Password must be at least 12 characters long' })
    @MaxLength(255, { message: 'Password must not exceed 255 characters' })
    newPassword: string;
}
