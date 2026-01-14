import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateRecoveryRequestDto {
    @ApiProperty({
        example: 'S@perDuper5ecret_Pa55w0rd2004',
        description: 'Current password for verification',
    })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    currentPassword: string;

    @ApiProperty({
        example: 'What is your favorite color?',
        description: 'New security question',
    })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @MaxLength(1024)
    newQuestion: string;

    @ApiProperty({
        example: "'Ula'ula 'alani melemele",
        description: 'New answer to the security question',
    })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @MaxLength(1024)
    newAnswer: string;
}
