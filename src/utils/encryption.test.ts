import { encryptData, decryptData } from './encryption';

describe('encryption', () => {
  it('correctly encrypts and decrypts a plain text payload', async () => {
    const payload = JSON.stringify({ name: 'LendSwift', amount: 500000 });
    const secret = 'LendSwift-Secure-Draft-Secret';

    const encrypted = await encryptData(payload, secret);
    expect(encrypted).toBeDefined();
    expect(encrypted).not.toBe(payload);

    const decrypted = await decryptData(encrypted, secret);
    expect(decrypted).toBe(payload);
    expect(JSON.parse(decrypted)).toEqual({ name: 'LendSwift', amount: 500000 });
  });

  it('fails decryption with incorrect secret key', async () => {
    const payload = 'Super secret payload';
    const encrypted = await encryptData(payload, 'secret1');

    await expect(decryptData(encrypted, 'secret2')).rejects.toThrow();
  });
});
