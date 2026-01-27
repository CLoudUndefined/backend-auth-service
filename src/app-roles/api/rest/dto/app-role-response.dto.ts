import { ApiProperty } from '@nestjs/swagger';
import { ApplicationRoleModel } from 'src/database/models/application-role.model';

export class AppRoleResponseDto {
    constructor(data: ApplicationRoleModel) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
    @ApiProperty({
        example: 1,
        description: 'Role ID',
    })
    id: number;

    @ApiProperty({
        example: 'Manager',
        description: 'Role Name',
    })
    name: string;

    @ApiProperty({
        example: 'Can manage content',
        description: 'Role Description',
        nullable: true,
        required: false,
    })
    description?: string | null;

    @ApiProperty({
        example: '2025-11-23T12:34:56.000Z',
        description: 'Timestamp when the app role was created',
    })
    createdAt: Date;

    @ApiProperty({
        example: '2025-11-23T12:34:56.000Z',
        description: 'Timestamp when the app role was last updated',
    })
    updatedAt: Date;
}
