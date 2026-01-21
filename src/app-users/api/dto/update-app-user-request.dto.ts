import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateAppUserRequestDto {
    @ApiProperty({
        example: 'developer@example.com',
        description: 'New email for the user',
    })
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(255)
    email: string;
}
