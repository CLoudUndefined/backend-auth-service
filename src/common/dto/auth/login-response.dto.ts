import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT Access Token to be used in Authorization header (Bearer)',
    })
    accessToken: string;

    @ApiProperty({
        example: 'dcc434-82e3-4...',
        description: 'Refresh Token to obtain a new Access Token when the current one expires',
    })
    refreshToken: string;
}
