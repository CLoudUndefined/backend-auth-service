import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateServiceUserRequestDto {
    @ApiProperty({
        example: 'developer@example.com',
        description: 'Service user email address.',
        required: true,
    })
    @IsDefined()
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(255)
    email: string;
}
