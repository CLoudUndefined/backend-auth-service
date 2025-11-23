import { Body, Controller, NotImplementedException, Post } from '@nestjs/common';
import { ChangePasswordDto } from 'src/common/dto/auth/change-password.dto';
import { LoginResponseDto } from 'src/common/dto/auth/login-response.dto';
import { LoginDto } from 'src/common/dto/auth/login.dto';
import { RecoveryAskResponseDto } from 'src/common/dto/auth/recovery-ask-response.dto';
import { RecoveryAskDto } from 'src/common/dto/auth/recovery-ask.dto';
import { RecoveryResetDto } from 'src/common/dto/auth/recovery-reset.dto';
import { RegisterDto } from 'src/common/dto/auth/register.dto';
import { UpdateRecoveryResponseDto } from 'src/common/dto/auth/update-recovery-response.dto';
import { UpdateRecoveryDto } from 'src/common/dto/auth/update-recovery.dto';
import { MessageResponseDto } from 'src/common/dto/message-response.dto';
import { ServiceUserResponseDto } from 'src/service-users/dto/service-user-response.dto';

@Controller('apps/:appId/auth')
export class AppAuthController {
    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<ServiceUserResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('change-password')
    async changePassword(@Body() changePasswordDto: ChangePasswordDto): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('recovery/ask')
    async recoveryAsk(@Body() recoveryAskDto: RecoveryAskDto): Promise<RecoveryAskResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('recovery/reset')
    async recoveryReset(@Body() recoveryResetDto: RecoveryResetDto): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('recovery/update')
    async updateRecovery(@Body() updateRecoveryDto: UpdateRecoveryDto): Promise<UpdateRecoveryResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }
}
