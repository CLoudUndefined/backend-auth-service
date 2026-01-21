import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly key: Buffer;

    constructor(private readonly configService: ConfigService) {
        this.key = Buffer.from(this.configService.getOrThrow<string>('APP_ENCRYPTION_KEY'), 'hex');
    }

    encrypt(text: string): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();

        return `${iv.toString('hex')}:${encrypted.toString('hex')}:${tag.toString('hex')}`;
    }

    decrypt(encryptedData: string): string {
        const [ivHex, encryptedHex, tagHex] = encryptedData.split(':');

        const decipher = crypto.createDecipheriv(this.algorithm, this.key, Buffer.from(ivHex, 'hex'));
        decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

        const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]);

        return decrypted.toString('utf8');
    }
}
