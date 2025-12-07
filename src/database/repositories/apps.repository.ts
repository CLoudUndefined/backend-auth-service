import { Injectable } from '@nestjs/common';
import { ApplicationModel } from 'src/database/models/application.model';

@Injectable()
export class AppsRepository {
    async create(
        ownerId: number,
        name: string,
        encryptedSecret: string,
        description?: string,
    ): Promise<ApplicationModel> {
        return ApplicationModel.query().insert({
            ownerId,
            name,
            encryptedSecret,
            description: description,
        });
    }

    async findById(id: number): Promise<ApplicationModel | undefined> {
        return ApplicationModel.query().findById(id).withGraphFetched('owner');
    }

    async findAllByOwner(ownerId: number): Promise<ApplicationModel[]> {
        return ApplicationModel.query().where('ownerId', ownerId);
    }

    async findAll(): Promise<ApplicationModel[]> {
        return ApplicationModel.query().withGraphFetched('owner');
    }

    async update(
        id: number,
        data: Partial<Pick<ApplicationModel, 'name' | 'description'>>,
    ): Promise<ApplicationModel | undefined> {
        return ApplicationModel.query().patchAndFetchById(id, data);
    }

    async delete(id: number): Promise<number> {
        return ApplicationModel.query().deleteById(id);
    }

    async exists(ownerId: number, name: string): Promise<boolean> {
        const result = await ApplicationModel.query().findOne({ ownerId, name });
        return !!result;
    }
}
