import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class UpdateAppRoleRequestDto {
    @ApiProperty({
        example: 'Senior Manager',
        description: 'New name for the role',
        required: false,
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiProperty({
        description: 'New description',
        required: false,
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(1024)
    description?: string;

    @ApiProperty({
        example: [1, 3, 8],
        description: 'New list of Permission IDs. Replaces existing assignments.',
        required: false,
    })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsInt({ each: true })
    @IsPositive({ each: true })
    permissionIds?: number[];
}
