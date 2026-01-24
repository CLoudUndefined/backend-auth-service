import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUsersController } from './service-users.controller';
import { ServiceUsersService } from '../service/service-users.service';
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service-auth.guard';
import { IsGodGuard } from 'src/auth/guards/is-god.guard';
import { IsSelfOrGodGuard } from 'src/auth/guards/is-self-or-god.guard';
import { ServiceUserResponseDto } from './dto/service-user-response.dto';
import { AppResponseDto } from 'src/apps/api/dto/app-response.dto';

describe('ServiceUsersController', () => {
    let controller: ServiceUsersController;
    const mockServiceUsersService = {
        findByIdOrThrow: jest.fn(),
        update: jest.fn(),
        findAll: jest.fn(),
        delete: jest.fn(),
        findAllAppsByOwnerId: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ServiceUsersController],
            providers: [{ provide: ServiceUsersService, useValue: mockServiceUsersService }],
        })
            .overrideGuard(JwtServiceAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(IsGodGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(IsSelfOrGodGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<ServiceUsersController>(ServiceUsersController);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getProfile', () => {
        const user = { id: 1 };
        const serviceUser = {
            id: 1,
        };

        it('should successfully return current user profile', async () => {
            mockServiceUsersService.findByIdOrThrow.mockResolvedValue(serviceUser);

            const result = await controller.getProfile(user);

            expect(mockServiceUsersService.findByIdOrThrow).toHaveBeenCalledWith(1);
            expect(result).toBeInstanceOf(ServiceUserResponseDto);
            expect(result).toMatchObject({
                id: serviceUser.id,
            });
        });
    });

    describe('updateProfile', () => {
        const user = { id: 1 };
        const updateDto = { email: 'new-email-developer@example.com' };
        const updatedUser = {
            id: 1,
            email: 'new-email-developer@example.com',
        };

        it('should successfully update current user profile', async () => {
            mockServiceUsersService.update.mockResolvedValue(updatedUser);

            const result = await controller.updateProfile(user, updateDto);

            expect(mockServiceUsersService.update).toHaveBeenCalledWith(1, 'new-email-developer@example.com');
            expect(result).toBeInstanceOf(ServiceUserResponseDto);
            expect(result).toMatchObject({
                id: updatedUser.id,
                email: updatedUser.email,
            });
        });
    });

    describe('findAll', () => {
        const users = [{ id: 1 }, { id: 2 }];

        it('should successfully return all service users', async () => {
            mockServiceUsersService.findAll.mockResolvedValue(users);

            const result = await controller.findAll();

            expect(mockServiceUsersService.findAll).toHaveBeenCalledWith();
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(ServiceUserResponseDto);
            expect(result[1]).toBeInstanceOf(ServiceUserResponseDto);
            expect(result[0]).toMatchObject({
                id: users[0].id,
            });
            expect(result[1]).toMatchObject({
                id: users[1].id,
            });
        });
    });

    describe('getUser', () => {
        const userId = 1;
        const user = {
            id: userId,
        };

        it('should successfully return user by id', async () => {
            mockServiceUsersService.findByIdOrThrow.mockResolvedValue(user);

            const result = await controller.getUser(userId);

            expect(mockServiceUsersService.findByIdOrThrow).toHaveBeenCalledWith(userId);
            expect(result).toBeInstanceOf(ServiceUserResponseDto);
            expect(result).toMatchObject({
                id: user.id,
            });
        });
    });

    describe('deleteUser', () => {
        const userId = 1;

        it('should successfully delete user and return success message', async () => {
            mockServiceUsersService.delete.mockResolvedValue(undefined);

            const result = await controller.deleteUser(userId);

            expect(mockServiceUsersService.delete).toHaveBeenCalledWith(userId);
            expect(result).toBe({ message: 'Service user deleted successfully' });
        });
    });

    describe('findAllAppsByOwner', () => {
        const userId = 3;
        const user = {
            id: userId,
        };
        const apps = [
            { id: 1, owner: user },
            { id: 2, owner: user },
        ];

        it('should successfully return all apps owned by user', async () => {
            mockServiceUsersService.findAllAppsByOwnerId.mockResolvedValue(apps);

            const result = await controller.findAllAppsByOwner(userId);

            expect(mockServiceUsersService.findAllAppsByOwnerId).toHaveBeenCalledWith(userId);
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(AppResponseDto);
            expect(result[1]).toBeInstanceOf(AppResponseDto);
            expect(result[0]).toMatchObject({
                id: apps[0].id,
                owner: {
                    id: apps[0].owner.id,
                },
            });
            expect(result[1]).toMatchObject({
                id: apps[1].id,
                owner: {
                    id: apps[1].owner.id,
                },
            });
        });
    });
});
