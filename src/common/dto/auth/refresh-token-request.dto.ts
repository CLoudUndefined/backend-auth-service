import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenRequestDto {
    @ApiProperty({
        example: 'dcc43482efa34...',
        description: 'Valid Refresh Token issued during login',
    })
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}
