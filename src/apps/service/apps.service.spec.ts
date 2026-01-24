import { Test, TestingModule } from '@nestjs/testing';
import { AppsService } from './apps.service';
import { AppsRepository } from 'src/database/repositories/apps.repository';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('AppsService', () => {
    let service: AppsService;
    const mockAppsRepository = {
        exists: jest.fn(),
        createWithOwner: jest.fn(),
        findAllWithOwner: jest.fn(),
        findByIdWithOwner: jest.fn(),
        updateWithOwner: jest.fn(),
        delete: jest.fn(),
    };
    const mockEncryptionService = {
        encrypt: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppsService,
                { provide: AppsRepository, useValue: mockAppsRepository },
                { provide: EncryptionService, useValue: mockEncryptionService },
            ],
        }).compile();

        service = module.get<AppsService>(AppsService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createApp', () => {
        const ownerId = 1;
        const name = 'mock-app-name';
        const description = 'mock-app-description';
        const encryptedSecret = 'mock-encrypted-secret';
        const app = { id: 2, ownerId, owner: { id: ownerId }, name };
        const appWithDescription = { id: 2, name, description, ownerId, owner: { id: ownerId } };

        it('should throw ConflictException if app with same name already exists', async () => {
            mockAppsRepository.exists.mockResolvedValue(true);

            await expect(service.createApp(ownerId, name)).rejects.toThrow(ConflictException);

            expect(mockAppsRepository.exists).toHaveBeenCalledWith(ownerId, name);
        });

        it('should successfully create app without description', async () => {
            mockAppsRepository.exists.mockResolvedValue(false);
            mockEncryptionService.encrypt.mockReturnValue(encryptedSecret);
            mockAppsRepository.createWithOwner.mockResolvedValue(app);

            const result = await service.createApp(ownerId, name);

            expect(mockAppsRepository.exists).toHaveBeenCalledWith(ownerId, name);
            expect(mockEncryptionService.encrypt).toHaveBeenCalled();
            expect(mockAppsRepository.createWithOwner).toHaveBeenCalledWith(ownerId, name, encryptedSecret, undefined);

            expect(result).toEqual(app);
        });

        it('should successfully create app with description', async () => {
            mockAppsRepository.exists.mockResolvedValue(false);
            mockEncryptionService.encrypt.mockReturnValue(encryptedSecret);
            mockAppsRepository.createWithOwner.mockResolvedValue(appWithDescription);

            const result = await service.createApp(ownerId, name, description);

            expect(mockAppsRepository.exists).toHaveBeenCalledWith(ownerId, name);
            expect(mockEncryptionService.encrypt).toHaveBeenCalled();
            expect(mockAppsRepository.createWithOwner).toHaveBeenCalledWith(
                ownerId,
                name,
                encryptedSecret,
                description,
            );

            expect(result).toEqual(appWithDescription);
        });
    });

    describe('findAllApps', () => {
        const apps = [
            { id: 1, ownerId: 1, owner: { id: 1 } },
            { id: 2, ownerId: 2, owner: { id: 2 } },
        ];

        it('should successfully return all apps', async () => {
            mockAppsRepository.findAllWithOwner.mockResolvedValue(apps);

            const result = await service.findAllApps();

            expect(mockAppsRepository.findAllWithOwner).toHaveBeenCalledWith();

            expect(result).toEqual(apps);
        });
    });

    describe('findAppById', () => {
        const appId = 1;
        const app = {
            id: appId,
            ownerId: 1,
            owner: { id: 1 },
        };

        it('should throw NotFoundException if app not found', async () => {
            mockAppsRepository.findByIdWithOwner.mockResolvedValue(null);

            await expect(service.findAppById(appId)).rejects.toThrow(NotFoundException);

            expect(mockAppsRepository.findByIdWithOwner).toHaveBeenCalledWith(appId);
        });

        it('should successfully return app', async () => {
            mockAppsRepository.findByIdWithOwner.mockResolvedValue(app);

            const result = await service.findAppById(appId);

            expect(mockAppsRepository.findByIdWithOwner).toHaveBeenCalledWith(appId);

            expect(result).toEqual(app);
        });
    });

    describe('updateApp', () => {
        const appId = 1;
        const ownerId = 2;
        const updatedAppName = {
            id: appId,
            name: 'mock-new-app-name',
            description: 'mock-app-description',
            owner: { id: ownerId },
            ownerId,
        };
        const updatedAppDescription = {
            id: appId,
            name: 'mock-app-name',
            description: 'mock-new-app-description',
            owner: { id: ownerId },
            ownerId,
        };
        const updatedAppAll = {
            id: appId,
            name: 'mock-new-app-name',
            description: 'mock-new-app-description',
            owner: { id: ownerId },
            ownerId,
        };

        it('should throw BadRequestException if no fields provided', async () => {
            await expect(service.updateApp(appId)).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException if updated app not found', async () => {
            mockAppsRepository.updateWithOwner.mockResolvedValue(null);

            await expect(service.updateApp(appId, 'mock-new-app-name')).rejects.toThrow(NotFoundException);

            expect(mockAppsRepository.updateWithOwner).toHaveBeenCalledWith(appId, {
                name: 'mock-new-app-name',
                description: undefined,
            });
        });

        it('should successfully update only name', async () => {
            mockAppsRepository.updateWithOwner.mockResolvedValue(updatedAppName);

            const result = await service.updateApp(appId, 'mock-new-app-name');

            expect(mockAppsRepository.updateWithOwner).toHaveBeenCalledWith(appId, {
                name: 'mock-new-app-name',
                description: undefined,
            });

            expect(result).toEqual(updatedAppName);
        });

        it('should successfully update only description', async () => {
            mockAppsRepository.updateWithOwner.mockResolvedValue(updatedAppDescription);

            const result = await service.updateApp(appId, undefined, 'mock-new-app-description');

            expect(mockAppsRepository.updateWithOwner).toHaveBeenCalledWith(appId, {
                name: undefined,
                description: 'mock-new-app-description',
            });

            expect(result).toEqual(updatedAppDescription);
        });

        it('should successfully update name and description', async () => {
            mockAppsRepository.updateWithOwner.mockResolvedValue(updatedAppAll);

            const result = await service.updateApp(appId, 'mock-new-app-name', 'mock-new-app-description');

            expect(mockAppsRepository.updateWithOwner).toHaveBeenCalledWith(appId, {
                name: 'mock-new-app-name',
                description: 'mock-new-app-description',
            });

            expect(result).toEqual(updatedAppAll);
        });
    });

    describe('deleteApp', () => {
        const appId = 1;

        it('should successfully delete app', async () => {
            mockAppsRepository.delete.mockResolvedValue(undefined);

            await service.deleteApp(appId);

            expect(mockAppsRepository.delete).toHaveBeenCalledWith(appId);
        });
    });

    describe('regenerateSecret', () => {
        const appId = 1;
        const encryptedSecret = 'mock-encrypted-secret';

        it('should throw NotFoundException if app not found', async () => {
            mockEncryptionService.encrypt.mockReturnValue(encryptedSecret);
            mockAppsRepository.updateWithOwner.mockResolvedValue(null);

            await expect(service.regenerateSecret(appId)).rejects.toThrow(NotFoundException);

            expect(mockEncryptionService.encrypt).toHaveBeenCalled();
            expect(mockAppsRepository.updateWithOwner).toHaveBeenCalledWith(appId, {
                encryptedSecret,
            });
        });

        it('should successfully regenerate secret', async () => {
            mockEncryptionService.encrypt.mockReturnValue(encryptedSecret);
            mockAppsRepository.updateWithOwner.mockResolvedValue({ id: appId });

            await service.regenerateSecret(appId);

            expect(mockEncryptionService.encrypt).toHaveBeenCalled();
            expect(mockAppsRepository.updateWithOwner).toHaveBeenCalledWith(appId, {
                encryptedSecret,
            });
        });
    });
});
