import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRecoveryDto {
    @ApiProperty({
        example: 'S@perDuper5ecret_Pa55w0rd2004',
        description: 'Current password for verification',
    })
    @IsNotEmpty()
    @IsString()
    currentPassword: string;

    @ApiProperty({
        example: 'What is your favorite color?',
        description: 'New security question',
    })
    @IsNotEmpty()
    @IsString()
    newQuestion: string;

    @ApiProperty({
        example: "'Ula'ula 'alani melemele",
        description: 'New answer to the security question',
    })
    @IsNotEmpty()
    @IsString()
    newAnswer: string;
}
