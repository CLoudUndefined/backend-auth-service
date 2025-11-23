import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, MaxLength } from 'class-validator';

export class UpdateServiceUserRequestDto {
    @ApiProperty({
        example: 'developer@example.com',
        description: 'Service user email address.',
        required: false,
    })
    @IsEmail(
        {},
        {
            message: 'Email must be a valid email address',
        },
    )
    @IsOptional()
    @MaxLength(255, {
        message: 'Email must not exceed 255 characters',
    })
    email?: string;
}
