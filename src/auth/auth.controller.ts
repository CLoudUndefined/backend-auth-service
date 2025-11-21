import { Body, Controller, NotImplementedException, Post } from '@nestjs/common';
import { ServiceUserResponseDto } from 'src/service-users/dto/service-user-response.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RecoveryAskDto } from './dto/recovery-ask.dto';
import { RecoveryResetDto } from './dto/recovery-reset.dto';
import { UpdateRecoveryDto } from './dto/update-recovery.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RecoveryAskResponseDto } from './dto/recovery-ask-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { UpdateRecoveryResponseDto } from './dto/update-recovery-response.dto';

@Controller('auth')
export class AuthController {
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
