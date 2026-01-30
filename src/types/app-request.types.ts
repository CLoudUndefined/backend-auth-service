import { Request } from 'express';
import { AuthenticatedAppUser } from 'src/app-auth/interfaces/authenticated-app-user.interface';

export type AppRequest = Request & {
    user: AuthenticatedAppUser;
};
