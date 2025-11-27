import { ApiProperty } from "@nestjs/swagger";

export class RecoveryQuestionDto {
    @ApiProperty({
        example: 1,
        description: 'Recovery question ID',
    })
    id: number;

    @ApiProperty({
        example: "What is your mother's maiden name?",
        description: 'The security question',
    })
    question: string;
}