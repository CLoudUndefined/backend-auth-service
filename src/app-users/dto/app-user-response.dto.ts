import { ApiProperty } from '@nestjs/swagger';
import { AppRoleResponseDto } from 'src/app-roles/dto/app-role-response.dto';

export class AppUserResponseDto {
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
        type: () => [AppRoleResponseDto],
        description: 'Assigned roles',
        isArray: true,
    })
    roles: AppRoleResponseDto[];

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
