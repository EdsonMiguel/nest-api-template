import { Injectable } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { PasswordHasher } from '../../application/cryptography/password-hasher';

const scrypt = promisify(scryptCallback);

@Injectable()
export class ScryptPasswordHasher implements PasswordHasher {
  async hash(plainText: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(plainText, salt, 64)) as Buffer;

    return `scrypt:${salt}:${derivedKey.toString('hex')}`;
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    const [algorithm, salt, storedHash] = hash.split(':');

    if (algorithm !== 'scrypt' || !salt || !storedHash) {
      return false;
    }

    const derivedKey = (await scrypt(plainText, salt, 64)) as Buffer;
    const storedKey = Buffer.from(storedHash, 'hex');

    if (derivedKey.length !== storedKey.length) {
      return false;
    }

    return timingSafeEqual(derivedKey, storedKey);
  }
}
