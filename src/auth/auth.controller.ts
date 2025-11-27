import { Body, Controller, Delete, Get, NotImplementedException, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ServiceUserResponseDto } from 'src/service-users/dto/service-user-response.dto';
import { RegisterRequestDto } from '../common/dto/auth/register-request.dto';
import { LoginRequestDto } from '../common/dto/auth/login-request.dto';
import { ChangePasswordRequestDto } from '../common/dto/auth/change-password-request.dto';
import { RecoveryAskRequestDto } from '../common/dto/auth/recovery-ask-request.dto';
import { RecoveryResetRequestDto } from '../common/dto/auth/recovery-reset-request.dto';
import { LoginResponseDto } from '../common/dto/auth/login-response.dto';
import { RecoveryAskResponseDto } from '../common/dto/auth/recovery-ask-response.dto';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AddRecoveryRequestDto } from 'src/common/dto/auth/add-recovery-request.dto';
import { UpdateRecoveryRequestDto } from 'src/common/dto/auth/update-recovery-request.dto';
import { ListRecoveryResponseDto } from 'src/common/dto/auth/list-recovery-response.dto';

@ApiTags('Service (User Auth)')
@Controller('auth')
export class AuthController {
    @Post('register')
    @ApiOperation({
        summary: 'Register a new service user',
        description: 'Creates a new account for managing applications.',
    })
    @ApiResponse({
        status: 201,
        description: 'User registered successfully',
        type: ServiceUserResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 409,
        description: 'Email already exists',
    })
    async register(@Body() RegisterRequestDto: RegisterRequestDto): Promise<ServiceUserResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('login')
    @ApiOperation({
        summary: 'Login to platform',
        description: 'Authenticates a service user and returns a JWT token.',
    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        type: LoginResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid email or password',
    })
    async login(@Body() LoginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('change-password')
    @ApiBearerAuth('JWT-auth-service')
    @ApiOperation({
        summary: 'Change password',
        description: 'Allows an authenticated user to change their password.',
    })
    @ApiResponse({
        status: 200,
        description: 'Password changed successfully',
        type: MessageResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed or new password too weak',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized or Wrong old password',
    })
    async changePassword(@Body() ChangePasswordRequestDto: ChangePasswordRequestDto): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('recovery')
    @ApiBearerAuth('JWT-auth-service')
    @ApiOperation({
        summary: 'Add recovery question',
        description: 'Adds a new security question for password recovery.',
    })
    @ApiResponse({
        status: 201,
        description: 'Recovery question added',
        type: MessageResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    async addRecovery(@Body() addDto: AddRecoveryRequestDto): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Get('recovery')
    @ApiBearerAuth('JWT-auth-service')
    @ApiOperation({
        summary: 'List recovery questions',
        description: 'Returns all recovery questions for the authenticated user.',
    })
    @ApiResponse({
        status: 200,
        description: 'List of recovery questions',
        type: ListRecoveryResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiBearerAuth('JWT-auth-service')
    async listRecovery(): Promise<ListRecoveryResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('recovery/ask')
    @ApiOperation({
        summary: 'Get recovery questions',
        description: 'Retrieves the security questions for the provided email.',
    })
    @ApiResponse({
        status: 200,
        description: 'Questions retrieved successfully',
        type: RecoveryAskResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 404,
        description: 'User with this email not found',
    })
    async recoveryAsk(@Body() RecoveryAskRequestDto: RecoveryAskRequestDto): Promise<RecoveryAskResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('recovery/reset')
    @ApiOperation({
        summary: 'Reset password',
        description: 'Resets the password using the answer to the security question.',
    })
    @ApiResponse({
        status: 200,
        description: 'Password reset successful',
        type: MessageResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Wrong answer or invalid data',
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    async recoveryReset(@Body() RecoveryResetRequestDto: RecoveryResetRequestDto): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Put('recovery/:recoveryId')
    @ApiBearerAuth('JWT-auth-service')
    @ApiOperation({
        summary: 'Update recovery question',
        description: 'Updates an existing security question and/or answer.',
    })
    @ApiParam({
        name: 'recoveryId',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Recovery question updated',
        type: MessageResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 404,
        description: 'Recovery question not found',
    })
    async updateRecovery(
        @Param('recoveryId', ParseIntPipe) recoveryId: number,
        @Body() updateDto: UpdateRecoveryRequestDto,
    ): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Delete('recovery/:recoveryId')
    @ApiBearerAuth('JWT-auth-service')
    @ApiOperation({
        summary: 'Remove recovery question',
        description: 'Removes a security question from the user.',
    })
    @ApiParam({
        name: 'recoveryId',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Recovery question removed',
        type: MessageResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 404,
        description: 'Recovery question not found',
    })
    async removeRecovery(@Param('recoveryId', ParseIntPipe) recoveryId: number): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }
}
