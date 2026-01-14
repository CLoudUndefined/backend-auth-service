import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenRequestDto {
    @ApiProperty({
        example: 'dcc43482efa34...',
        description: 'Valid Refresh Token issued during login',
    })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}
