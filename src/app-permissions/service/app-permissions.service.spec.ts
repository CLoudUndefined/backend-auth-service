import { Test, TestingModule } from '@nestjs/testing';
import { AppPermissionsService } from './app-permissions.service';
import { AppPermissionsRepository } from 'src/database/repositories/app-permissions.repository';
import { NotFoundException } from '@nestjs/common';

describe('AppPermissionsService', () => {
    let service: AppPermissionsService;
    const mockAppPermissionsRepository = {
        findAll: jest.fn(),
        findById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppPermissionsService,
                { provide: AppPermissionsRepository, useValue: mockAppPermissionsRepository },
            ],
        }).compile();

        service = module.get<AppPermissionsService>(AppPermissionsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAllPermissions', () => {
        const mockPermissions = [
            {
                id: 1,
                name: 'mock-permission-name-1',
                description: 'mock-permission-description-1',
            },
            {
                id: 2,
                name: 'mock-permission-name-1',
                description: 'mock-permission-description-2',
            },
        ];

        it('should return array of all permissions', async () => {
            mockAppPermissionsRepository.findAll.mockResolvedValue(mockPermissions);

            const result = await service.getAllPermissions();

            expect(result).toEqual(mockPermissions);

            expect(mockAppPermissionsRepository.findAll).toHaveBeenCalledWith();
        });
    });

    describe('getPermission', () => {
        const permissionId = 1;
        const mockPermission = { id: 1, name: 'mock-permission-name', description: 'mock-permission-description' };

        it('should throw NotFoundException if permission not found', async () => {
            mockAppPermissionsRepository.findById.mockResolvedValue(undefined);

            await expect(service.getPermission(permissionId)).rejects.toThrow(NotFoundException);

            expect(mockAppPermissionsRepository.findById).toHaveBeenCalledWith(permissionId);
        });

        it('should successfully return permission by id', async () => {
            mockAppPermissionsRepository.findById.mockResolvedValue(mockPermission);

            const result = await service.getPermission(permissionId);

            expect(result).toEqual(mockPermission);
            expect(mockAppPermissionsRepository.findById).toHaveBeenCalledWith(permissionId);
        });
    });
});
