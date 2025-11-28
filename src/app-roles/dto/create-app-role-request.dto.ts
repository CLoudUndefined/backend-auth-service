import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateAppRoleRequestDto {
    @ApiProperty({
        example: 'Manager',
        description: 'Unique name of the role within the app',
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name: string;

    @ApiProperty({
        example: 'Can manage content',
        description: 'Description of what this role can do',
        required: false,
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(1024)
    description?: string;

    @ApiProperty({
        example: [1, 2, 5],
        description: 'Array of Permission IDs to assign to this role immediately',
        required: false,
    })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsInt({ each: true })
    @IsPositive({ each: true })
    permissionIds?: number[];
}
