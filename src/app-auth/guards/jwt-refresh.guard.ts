import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAppRefreshGuard extends AuthGuard('jwt-refresh-app') {}
