import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginRequestDto {
    @ApiProperty({
        example: 'developer@example.com',
        description: 'Registered email address of the user',
    })
    @IsDefined()
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(255)
    email: string;

    @ApiProperty({
        example: 'S@perDuper5ecret_Pa55w0rd2004',
        description: 'User password',
    })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @MinLength(12)
    @MaxLength(255)
    password: string;
}
