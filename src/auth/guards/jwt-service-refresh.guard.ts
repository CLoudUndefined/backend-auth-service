import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtServiceRefreshGuard extends AuthGuard('jwt-refresh-service') {}
