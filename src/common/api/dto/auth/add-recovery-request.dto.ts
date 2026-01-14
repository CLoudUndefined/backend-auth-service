import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AddRecoveryRequestDto {
    @ApiProperty({
        example: 'What is your pet name?',
        description: 'Security question for password recovery',
    })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @MaxLength(1024)
    recoveryQuestion: string;

    @ApiProperty({
        example: 'Domestos',
        description: 'Answer to the security question',
    })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @MaxLength(1024)
    recoveryAnswer: string;
}
