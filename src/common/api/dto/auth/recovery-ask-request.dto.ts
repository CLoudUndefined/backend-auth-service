import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsNotEmpty } from 'class-validator';

export class RecoveryAskRequestDto {
    @ApiProperty({
        example: 'developer@example.com',
        description: 'Email address to find the recovery questions for',
    })
    @IsDefined()
    @IsNotEmpty()
    @IsEmail()
    email: string;
}
