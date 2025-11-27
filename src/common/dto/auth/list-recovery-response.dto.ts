import { ApiProperty } from "@nestjs/swagger";
import { RecoveryQuestionDto } from "./recovery-question.dto";

export class ListRecoveryResponseDto {
    @ApiProperty({
        type: [RecoveryQuestionDto],
        description: 'List of recovery questions',
    })
    questions: RecoveryQuestionDto[];
}