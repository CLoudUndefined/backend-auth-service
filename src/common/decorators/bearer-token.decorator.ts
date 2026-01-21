import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const BearerToken = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Bearer token is required');
    }

    return authHeader.split(' ')[1];
});
