import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenRequestDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'Valid Refresh Token issued during login',
    })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}
