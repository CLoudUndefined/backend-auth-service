import { Inject, Injectable } from '@nestjs/common';
import type { ModelClass } from 'objection';
import { ApplicationModel } from 'src/database/models/application.model';
import { ApplicationWithOwnerModel } from 'src/types/application.types';

@Injectable()
export class AppsRepository {
    constructor(@Inject(ApplicationModel) private readonly model: ModelClass<ApplicationModel>) {}

    async createWithOwner(
        ownerId: number,
        name: string,
        encryptedSecret: string,
        description?: string | null,
    ): Promise<ApplicationWithOwnerModel> {
        const app = this.model
            .query()
            .insert({
                ownerId,
                name,
                encryptedSecret,
                description: description,
            })
            .withGraphFetched('owner')
            .castTo<ApplicationWithOwnerModel>();
        return app;
    }

    async findById(id: number): Promise<ApplicationModel | undefined> {
        return this.model.query().findById(id);
    }

    async findByIdWithOwner(id: number): Promise<ApplicationWithOwnerModel | undefined> {
        const app = this.model.query().findById(id).withGraphFetched('owner');
        return app.castTo<ApplicationWithOwnerModel | undefined>();
    }

    async findAllByOwnerIdWithOwner(ownerId: number): Promise<ApplicationWithOwnerModel[]> {
        const apps = this.model.query().where({ ownerId }).withGraphFetched('owner');
        return apps.castTo<ApplicationWithOwnerModel[]>();
    }

    async findAllWithOwner(): Promise<ApplicationWithOwnerModel[]> {
        const apps = this.model.query().withGraphFetched('owner');
        return apps.castTo<ApplicationWithOwnerModel[]>();
    }

    async updateWithOwner(
        id: number,
        data: Partial<Pick<ApplicationModel, 'name' | 'description' | 'encryptedSecret'>>,
    ): Promise<ApplicationWithOwnerModel | undefined> {
        const app = this.model.query().patchAndFetchById(id, data).withGraphFetched('owner');
        return app.castTo<ApplicationWithOwnerModel | undefined>();
    }

    async delete(id: number): Promise<number> {
        return this.model.query().deleteById(id);
    }

    async exists(ownerId: number, name: string): Promise<boolean> {
        const result = await this.model.query().where({ ownerId, name }).select(1).first();
        return !!result;
    }

    async existsByOwnerId(ownerId: number): Promise<boolean> {
        const result = await this.model.query().where({ ownerId }).select(1).first();
        return !!result;
    }
}
