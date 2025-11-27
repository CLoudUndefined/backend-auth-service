import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RecoveryResetRequestDto {
    @ApiProperty({
        example: 'developer@example.com',
        description: 'Email address of the user resetting the password',
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    email: string;

    @ApiProperty({
        example: 'Smith',
        description: 'Answer to the security question',
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(1024)
    answer: string;

    @ApiProperty({
        example: 'MegaPa55w0rd2008_AlEx',
        description: 'New password to be set',
        minLength: 12,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(12)
    @MaxLength(255)
    newPassword: string;
}
