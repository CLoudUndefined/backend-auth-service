import { ApplicationModel } from 'src/database/models/application.model';
import { ServiceUserModel } from 'src/database/models/service-user.model';

export type ApplicationWithOwnerModel = ApplicationModel & { owner: ServiceUserModel };
