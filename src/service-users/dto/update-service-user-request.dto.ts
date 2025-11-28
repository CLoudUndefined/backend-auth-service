import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, MaxLength } from 'class-validator';

export class UpdateServiceUserRequestDto {
    @ApiProperty({
        example: 'developer@example.com',
        description: 'Service user email address.',
        required: false,
    })
    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string;
}
