import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

export class UpdateServiceUserRequestDto {
    @ApiProperty({
        example: 'developer@example.com',
        description: 'Service user email address.',
        required: true,
    })
    @IsEmail()
    @MaxLength(255)
    email: string;
}
