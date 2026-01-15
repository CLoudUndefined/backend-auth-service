import { ApiProperty } from '@nestjs/swagger';

export class PermissionResponseDto {
    @ApiProperty({
        example: 1,
        description: 'Permission ID',
    })
    id: number;

    @ApiProperty({
        example: 'users.manage',
        description: 'Permission name',
    })
    name: string;

    @ApiProperty({
        example: 'User manage',
        description: 'Permission description',
        nullable: true,
        required: false,
    })
    description?: string | null;

    @ApiProperty({
        example: '2025-11-23T12:34:56.000Z',
        description: 'Timestamp when the permission was created',
    })
    createdAt: Date;
}
