import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
    @ApiProperty({
        example: 'Operation completed successfully',
        description: 'Information message about the status of the operation',
    })
    message: string;
}
