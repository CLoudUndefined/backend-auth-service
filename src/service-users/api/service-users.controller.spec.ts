import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUsersController } from './service-users.controller';
import { ServiceUsersService } from '../service/service-users.service';
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service-auth.guard';
import { IsGodGuard } from 'src/auth/guards/is-god.guard';
import { IsSelfOrGodGuard } from 'src/auth/guards/is-self-or-god.guard';

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
            email: 'developer@example.com',
            isGod: false,
            createdAt: new Date('2026-01-21'),
            updatedAt: new Date('2026-01-22'),
        };

        it('should successfully return current user profile', async () => {
            mockServiceUsersService.findByIdOrThrow.mockResolvedValue(serviceUser);

            const result = await controller.getProfile(user);

            expect(mockServiceUsersService.findByIdOrThrow).toHaveBeenCalledWith(1);
            expect(result).toEqual({
                id: serviceUser.id,
                email: serviceUser.email,
                isGod: serviceUser.isGod,
                createdAt: serviceUser.createdAt,
                updatedAt: serviceUser.updatedAt,
            });
        });
    });

    describe('updateProfile', () => {
        const user = { id: 1 };
        const updateDto = { email: 'new-email-developer@example.com' };
        const updatedUser = {
            id: 1,
            email: 'new-email-developer@example.com',
            isGod: false,
            createdAt: new Date('2026-01-21'),
            updatedAt: new Date('2026-01-22'),
        };

        it('should successfully update current user profile', async () => {
            mockServiceUsersService.update.mockResolvedValue(updatedUser);

            const result = await controller.updateProfile(user, updateDto);

            expect(mockServiceUsersService.update).toHaveBeenCalledWith(1, 'new-email-developer@example.com');
            expect(result).toEqual({
                id: updatedUser.id,
                email: updatedUser.email,
                isGod: updatedUser.isGod,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt,
            });
        });
    });

    describe('findAll', () => {
        const users = [
            {
                id: 1,
                email: 'developer-1@example.com',
                isGod: false,
                createdAt: new Date('2026-01-21'),
                updatedAt: new Date('2026-01-22'),
            },
            {
                id: 2,
                email: 'developer-2@example.com',
                isGod: true,
                createdAt: new Date('2026-01-23'),
                updatedAt: new Date('2026-01-24'),
            },
        ];

        it('should successfully return all service users', async () => {
            mockServiceUsersService.findAll.mockResolvedValue(users);

            const result = await controller.findAll();

            expect(mockServiceUsersService.findAll).toHaveBeenCalledWith();
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                id: users[0].id,
                email: users[0].email,
                isGod: users[0].isGod,
                createdAt: users[0].createdAt,
                updatedAt: users[0].updatedAt,
            });
            expect(result[1]).toEqual({
                id: users[1].id,
                email: users[1].email,
                isGod: users[1].isGod,
                createdAt: users[1].createdAt,
                updatedAt: users[1].updatedAt,
            });
        });
    });

    describe('getUser', () => {
        const userId = 1;
        const user = {
            id: userId,
            email: 'developer@example.com',
            isGod: false,
            createdAt: new Date('2026-01-21'),
            updatedAt: new Date('2026-01-22'),
        };

        it('should successfully return user by id', async () => {
            mockServiceUsersService.findByIdOrThrow.mockResolvedValue(user);

            const result = await controller.getUser(userId);

            expect(mockServiceUsersService.findByIdOrThrow).toHaveBeenCalledWith(userId);
            expect(result).toEqual({
                id: user.id,
                email: user.email,
                isGod: user.isGod,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            });
        });
    });

    describe('deleteUser', () => {
        const userId = 1;

        it('should successfully delete user and return success message', async () => {
            mockServiceUsersService.delete.mockResolvedValue(undefined);

            const result = await controller.deleteUser(userId);

            expect(mockServiceUsersService.delete).toHaveBeenCalledWith(userId);

            expect(result).toEqual({ message: 'Service user deleted successfully' });
        });
    });

    describe('findAllAppsByOwner', () => {
        const userId = 3;
        const user = {
            id: userId,
            email: 'developer@example.com',
            isGod: false,
            createdAt: new Date('2026-01-21'),
            updatedAt: new Date('2026-01-22'),
        };
        const apps = [
            {
                id: 1,
                name: 'mock-app-name-1',
                description: 'mock-app-description',
                owner: user,
                createdAt: new Date('2026-01-23'),
                updatedAt: new Date('2026-01-24'),
            },
            {
                id: 2,
                name: 'mock-app-name-2',
                description: null,
                owner: user,
                createdAt: new Date('2026-01-25'),
                updatedAt: new Date('2026-01-26'),
            },
        ];

        it('should successfully return all apps owned by user', async () => {
            mockServiceUsersService.findAllAppsByOwnerId.mockResolvedValue(apps);

            const result = await controller.findAllAppsByOwner(userId);

            expect(mockServiceUsersService.findAllAppsByOwnerId).toHaveBeenCalledWith(userId);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                id: apps[0].id,
                name: apps[0].name,
                description: apps[0].description,
                owner: {
                    id: apps[0].owner.id,
                    email: apps[0].owner.email,
                    isGod: apps[0].owner.isGod,
                    createdAt: apps[0].owner.createdAt,
                    updatedAt: apps[0].owner.updatedAt,
                },
                createdAt: apps[0].createdAt,
                updatedAt: apps[0].updatedAt,
            });
            expect(result[1]).toEqual({
                id: apps[1].id,
                name: apps[1].name,
                description: apps[1].description,
                owner: {
                    id: apps[1].owner.id,
                    email: apps[1].owner.email,
                    isGod: apps[1].owner.isGod,
                    createdAt: apps[1].owner.createdAt,
                    updatedAt: apps[1].owner.updatedAt,
                },
                createdAt: apps[1].createdAt,
                updatedAt: apps[1].updatedAt,
            });
        });
    });
});
