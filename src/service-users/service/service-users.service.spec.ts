import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUsersService } from './service-users.service';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';
import { AppsRepository } from 'src/database/repositories/apps.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ServiceUsersService', () => {
    let service: ServiceUsersService;
    const mockServiceUsersRepository = {
        findAll: jest.fn(),
        findByEmail: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };
    const mockAppsRepository = {
        existsByOwnerId: jest.fn(),
        findAllByOwnerIdWithOwner: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ServiceUsersService,
                { provide: ServiceUsersRepository, useValue: mockServiceUsersRepository },
                { provide: AppsRepository, useValue: mockAppsRepository },
            ],
        }).compile();

        service = module.get<ServiceUsersService>(ServiceUsersService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('update', () => {
        const userId = 1;
        const anotherUserId = 2;
        const email = 'developer@example.com';

        it('should throw ConflictException if email already exists for another user', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue({ id: anotherUserId });

            await expect(service.update(userId, email)).rejects.toThrow(ConflictException);

            expect(mockServiceUsersRepository.findByEmail).toHaveBeenCalledWith(email);
        });

        it('should throw NotFoundException if update user not found', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue(undefined);
            mockServiceUsersRepository.update.mockResolvedValue(undefined);

            await expect(service.update(userId, email)).rejects.toThrow(NotFoundException);

            expect(mockServiceUsersRepository.update).toHaveBeenCalledWith(userId, { email });
        });

        it('should successfully update user when email is not taken', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue(null);
            mockServiceUsersRepository.update.mockResolvedValue({ id: userId, email });

            const result = await service.update(userId, email);

            expect(result).toEqual({ id: userId, email });
            expect(mockServiceUsersRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(mockServiceUsersRepository.update).toHaveBeenCalledWith(userId, { email });
        });
    });

    describe('delete', () => {
        const userId = 1;

        it('should throw NotFoundException if user does not exist', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue(undefined);

            await expect(service.delete(userId)).rejects.toThrow(NotFoundException);

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(userId);
        });

        it('should throw ConflictException if user has existing applications', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: userId });
            mockAppsRepository.existsByOwnerId.mockResolvedValue(true);

            await expect(service.delete(userId)).rejects.toThrow(ConflictException);

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(userId);
            expect(mockAppsRepository.existsByOwnerId).toHaveBeenCalledWith(userId);
        });

        it('should successfully delete user when user exists and has no applications', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: userId });
            mockAppsRepository.existsByOwnerId.mockResolvedValue(false);

            await service.delete(userId);

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(userId);
            expect(mockAppsRepository.existsByOwnerId).toHaveBeenCalledWith(userId);
            expect(mockServiceUsersRepository.delete).toHaveBeenCalledWith(userId);
        });
    });
});
