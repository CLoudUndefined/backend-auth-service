import { Request } from 'express';
import { AuthenticatedServiceUser } from 'src/auth/interfaces/authenticated-service-user.interface';

export type ServiceRequest = Request & {
    user: AuthenticatedServiceUser;
};
