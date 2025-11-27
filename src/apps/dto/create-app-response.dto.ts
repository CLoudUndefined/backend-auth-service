import { ApiProperty } from '@nestjs/swagger';
import { ServiceUserResponseDto } from 'src/service-users/dto/service-user-response.dto';

export class CreateAppResponseDto {
    @ApiProperty({
        example: 1,
        description: 'App ID',
    })
    id: number;

    @ApiProperty({
        example: 'My Cat Chat App',
        description: 'Application name',
    })
    name: string;

    @ApiProperty({
        example: 'Best app for talking about cats',
        description: 'Application description',
        nullable: true,
        required: false,
    })
    description?: string | null;

    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'Auto-generated secret key for signing JWTs within this app.',
    })
    secret: string;

    @ApiProperty({
        type: ServiceUserResponseDto,
        description: 'The service user who creates/owns this app',
    })
    owner: ServiceUserResponseDto;

    @ApiProperty({
        example: '2025-11-23T12:34:56.000Z',
        description: 'Timestamp when the app was created',
    })
    createdAt: Date;

    @ApiProperty({
        example: '2025-11-23T12:34:56.000Z',
        description: 'Timestamp when the app was last updated',
    })
    updatedAt: Date;
}
