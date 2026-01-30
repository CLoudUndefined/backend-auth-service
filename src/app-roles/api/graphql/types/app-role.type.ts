import { ApplicationRoleModel } from 'src/database/models/application-role.model';
import { AppRole as GeneratedAppRole } from 'src/graphql';

export class AppRole extends GeneratedAppRole {
    constructor(data: ApplicationRoleModel) {
        super();
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.createdAt = data.createdAt.toISOString();
        this.updatedAt = data.updatedAt.toISOString();
    }
}
