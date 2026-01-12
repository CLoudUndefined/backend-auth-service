import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateServiceUserRequestDto {
    @ApiProperty({
        example: 'developer@example.com',
        description: 'Service user email address.',
        required: true,
    })
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(255)
    email: string;
}
