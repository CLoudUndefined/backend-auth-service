import { ApiProperty } from '@nestjs/swagger';
import { PermissionResponseDto } from 'src/app-permissions/api/rest/dto/permission-response.dto';
import { ApplicationRoleWithPermissionsModel } from 'src/types/application-role.types';

export class AppRoleWithPermissionsResponseDto {
    constructor(data: ApplicationRoleWithPermissionsModel) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.permissions = data.permissions.map((permission) => {
            return new PermissionResponseDto(permission);
        });
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
        type: PermissionResponseDto,
        isArray: true,
        description: 'List of permissions assigned to this role',
    })
    permissions: PermissionResponseDto[];

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
