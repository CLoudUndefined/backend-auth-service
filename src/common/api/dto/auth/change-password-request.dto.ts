import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordRequestDto {
    @ApiProperty({
        example: 'S@perDuper5ecret_Pa55w0rd2004',
        description: 'Current active password',
    })
    @IsNotEmpty()
    @IsString()
    oldPassword: string;

    @ApiProperty({
        example: 'MegaPa55w0rd2008_AlEx',
        description: 'New password to set. Must be at least 12 characters.',
        minLength: 12,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(12)
    @MaxLength(255)
    newPassword: string;
}
