import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class AddRecoveryRequestDto {
    @ApiProperty({
        example: 'What is your pet name?',
        description: 'Security question for password recovery',
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(1024)
    recoveryQuestion: string;

    @ApiProperty({
        example: 'Domestos',
        description: 'Answer to the security question',
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(1024)
    recoveryAnswer: string;
}