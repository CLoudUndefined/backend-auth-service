import { ApplicationPermissionModel } from 'src/database/models/application-permission.model';
import { AppPermission as GeneratedAppPermission } from 'src/graphql';

export class AppPermission extends GeneratedAppPermission {
    constructor(data: ApplicationPermissionModel) {
        super();
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.createdAt = data.createdAt.toISOString();
    }
}
