import { ApiProperty } from '@nestjs/swagger';

export class UpdateRecoveryResponseDto {
    @ApiProperty({
        example: 'Recovery information updated successfully',
        description: 'Confirmation message',
    })
    message: string;

    @ApiProperty({
        example: 'What is your favorite color?',
        description: 'The newly set security question',
    })
    newQuestion: string;
}
