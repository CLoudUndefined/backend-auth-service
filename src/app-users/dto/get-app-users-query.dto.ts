import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';

export class GetAppUsersQueryDto {
    @ApiProperty({
        example: 1,
        description: 'Filter by Role ID',
    })
    @IsOptional()
    @IsInt()
    roleId?: number;
}
