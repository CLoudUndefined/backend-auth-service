import { Inject, Injectable } from '@nestjs/common';
import type { ModelClass } from 'objection';
import { ApplicationModel } from 'src/database/models/application.model';
import { ApplicationWithOwnerModel } from 'src/types/application.types';

@Injectable()
export class AppsRepository {
    constructor(@Inject(ApplicationModel) private readonly model: ModelClass<ApplicationModel>) {}

    async create(
        ownerId: number,
        name: string,
        encryptedSecret: string,
        description?: string,
    ): Promise<ApplicationWithOwnerModel> {
        const app = await this.model
            .query()
            .insert({
                ownerId,
                name,
                encryptedSecret,
                description: description,
            })
            .withGraphFetched('owner');

        return app as ApplicationWithOwnerModel;
    }

    async findById(id: number): Promise<ApplicationModel | undefined> {
        return this.model.query().findById(id);
    }

    async findWithOwnerById(id: number): Promise<ApplicationWithOwnerModel | undefined> {
        const app = await this.model.query().findById(id).withGraphFetched('owner');
        return app ? (app as ApplicationWithOwnerModel) : undefined;
    }

    async findAllByOwnerId(ownerId: number): Promise<ApplicationWithOwnerModel[]> {
        const apps = await this.model.query().where({ ownerId }).withGraphFetched('owner');
        return apps as ApplicationWithOwnerModel[];
    }

    async findAll(): Promise<ApplicationWithOwnerModel[]> {
        const apps = await this.model.query().withGraphFetched('owner');
        return apps as ApplicationWithOwnerModel[];
    }

    async update(
        id: number,
        data: Partial<Pick<ApplicationModel, 'name' | 'description'>>,
    ): Promise<ApplicationWithOwnerModel | undefined> {
        const app = await this.model.query().patchAndFetchById(id, data).withGraphFetched('owner');

        return app ? (app as ApplicationWithOwnerModel) : undefined;
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
