import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RecoveryAskRequestDto {
    @ApiProperty({
        example: 'developer@example.com',
        description: 'Email address to find the recovery question for',
    })
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail()
    email: string;
}
