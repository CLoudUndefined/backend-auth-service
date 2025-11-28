import { ApiProperty } from '@nestjs/swagger';
import { RecoveryQuestionDto } from './recovery-question.dto';

export class ListRecoveryResponseDto {
    @ApiProperty({
        type: RecoveryQuestionDto,
        isArray: true,
        description: 'List of recovery questions',
    })
    questions: RecoveryQuestionDto[];
}
