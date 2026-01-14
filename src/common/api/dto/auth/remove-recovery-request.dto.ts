import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RemoveRecoveryRequestDto {
    @ApiProperty({
        example: 'S@perDuper5ecret_Pa55w0rd2004',
        description: 'Current password for verification',
    })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    currentPassword: string;
}
