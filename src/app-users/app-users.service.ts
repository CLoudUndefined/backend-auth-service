import { Injectable } from '@nestjs/common';
import { AppUsersRepository } from 'src/database/repositories/app-users.repository';
import { ApplicationUserModel } from 'src/database/models/application-user.model';

@Injectable()
export class AppUsersService {
    constructor(private readonly appUsersRepository: AppUsersRepository) {}
    async findById(userId: number): Promise<ApplicationUserModel | undefined> {
        return this.appUsersRepository.findById(userId);
    }
}
