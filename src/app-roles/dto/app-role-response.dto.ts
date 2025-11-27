import { ApiProperty } from '@nestjs/swagger';
import { PermissionResponseDto } from 'src/app-permissions/dto/permission-response.dto';

export class AppRoleResponseDto {
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
