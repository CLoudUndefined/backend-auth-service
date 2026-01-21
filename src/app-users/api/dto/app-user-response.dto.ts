import { ApiProperty } from '@nestjs/swagger';
import { ApplicationUserModel } from 'src/database/models/application-user.model';

export class AppUserResponseDto {
    constructor(data: ApplicationUserModel) {
        this.id = data.id;
        this.email = data.email;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    @ApiProperty({
        example: 1,
        description: 'User ID within the system',
    })
    id: number;

    @ApiProperty({
        example: 'developer@example.com',
        description: 'User email',
    })
    email: string;

    @ApiProperty({
        example: '2025-11-23T12:34:56.000Z',
        description: 'Timestamp when the app user was created',
    })
    createdAt: Date;

    @ApiProperty({
        example: '2025-11-23T12:34:56.000Z',
        description: 'Timestamp when the app user was last updated',
    })
    updatedAt: Date;
}
