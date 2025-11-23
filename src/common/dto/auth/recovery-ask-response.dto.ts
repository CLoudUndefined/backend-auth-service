import { ApiProperty } from '@nestjs/swagger';

export class RecoveryAskResponseDto {
    @ApiProperty({
        example: 'What is your mother\'s maiden name?',
        description: 'The security question set by the user. Null if not set.',
        nullable: true
    })
    question: string | null;
}