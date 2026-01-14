import { ApiProperty } from '@nestjs/swagger';
import { ServiceUserModel } from 'src/database/models/service-user.model';

export class ServiceUserResponseDto {
    constructor(data: ServiceUserModel) {
        this.id = data.id;
        this.email = data.email;
        this.isGod = data.isGod;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    @ApiProperty({
        example: 1,
        description: 'Unique identifier of the service user',
    })
    id: number;

    @ApiProperty({
        example: 'developer@example.com',
        description: 'Email address of the service user',
    })
    email: string;

    @ApiProperty({
        example: false,
        description: 'Indicates if the service user has god-mode privileges (full system access)',
    })
    isGod: boolean;

    @ApiProperty({
        example: '2025-11-23T12:34:56.000Z',
        description: 'Timestamp when the service user was created',
    })
    createdAt: Date;

    @ApiProperty({
        example: '2025-11-23T12:34:56.000Z',
        description: 'Timestamp when the service user was last updated',
    })
    updatedAt: Date;
}
