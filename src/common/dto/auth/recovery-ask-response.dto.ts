import { ApiProperty } from '@nestjs/swagger';
import { RecoveryQuestionDto } from './recovery-question.dto';

export class RecoveryAskResponseDto {
    @ApiProperty({
        type: RecoveryQuestionDto,
        isArray: true,
        description: 'The security question set by the user. Null if not set.',
    })
    questions: RecoveryQuestionDto[];
}
