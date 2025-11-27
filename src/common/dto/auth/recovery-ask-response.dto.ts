import { ApiProperty } from '@nestjs/swagger';
import { RecoveryQuestionDto } from './recovery-question.dto';

export class RecoveryAskResponseDto {
    @ApiProperty({
        type: [RecoveryQuestionDto],
        description: 'The security question set by the user. Null if not set.',
    })
    questions: RecoveryQuestionDto[];
}
