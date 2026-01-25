import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './encryption.service';
import { ConfigService } from '@nestjs/config';

describe('EncryptionService', () => {
    let service: EncryptionService;
    const mockConfigService = {
        getOrThrow: jest.fn(),
    };
    const mockEncryptionKey = 'a'.repeat(64);

    beforeEach(async () => {
        mockConfigService.getOrThrow.mockReturnValue(mockEncryptionKey);

        const module: TestingModule = await Test.createTestingModule({
            providers: [EncryptionService, { provide: ConfigService, useValue: mockConfigService }],
        }).compile();

        service = module.get<EncryptionService>(EncryptionService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('encrypt', () => {
        const text = 'mock-plain-secret';

        it('should successfully encrypt text and return formatted string', () => {
            const result = service.encrypt(text);
            const parts = result.split(':');

            expect(result).toBeDefined();
            expect(typeof result).toBe('string');

            expect(result.split(':')).toHaveLength(3);
            expect(parts[0]).toMatch(/^[0-9a-f]+$/);
            expect(parts[1]).toMatch(/^[0-9a-f]+$/);
            expect(parts[2]).toMatch(/^[0-9a-f]+$/);
        });

        it('should generate different outputs for the same text', () => {
            const result1 = service.encrypt(text);
            const result2 = service.encrypt(text);

            expect(result1).not.toEqual(result2);
        });
    });

    describe('decrypt', () => {
        const text = 'mock-plain-secret';

        it('should throw error if encrypted data is malformed', () => {
            const malformedData = 'invalid:format!.1';

            expect(() => service.decrypt(malformedData)).toThrow();
        });

        it('should throw error if detected invalid tag', () => {
            const encrypted = service.encrypt(text);
            const parts = encrypted.split(':');
            parts[1] = 'a'.repeat(parts[1].length);
            const fakeEncrypted = parts.join(':');

            expect(() => service.decrypt(fakeEncrypted)).toThrow();
        });

        it('should throw if encrypted data has invalid format', () => {
            expect(() => service.decrypt('a:b')).toThrow();
            expect(() => service.decrypt('a:x:y:z')).toThrow();
        });

        it('should successfully decrypt encrypted data', () => {
            const encrypted = service.encrypt(text);
            const decrypted = service.decrypt(encrypted);

            expect(decrypted).toEqual(text);
        });
    });
});
