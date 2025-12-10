import { ModelOptions, QueryContext } from 'objection';
import { BaseModel } from './base.model';

export class BaseModelWithUpdate extends BaseModel {
    updatedAt: Date;

    $beforeInsert(queryContext: QueryContext): Promise<any> | void {
        super.$beforeInsert(queryContext);
        this.updatedAt = new Date();
    }

    $beforeUpdate(opt: ModelOptions, queryContext: QueryContext): Promise<any> | void {
        super.$beforeUpdate(opt, queryContext);
        this.updatedAt = new Date();
    }
}
