import { ApiProperty } from '@nestjs/swagger';
import { ApplicationPermissionModel } from 'src/database/models/application-permission.model';

export class PermissionResponseDto {
    constructor(data: ApplicationPermissionModel) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.createdAt = data.createdAt;
    }

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
