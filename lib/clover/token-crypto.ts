import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";

const getKey = (): Buffer => {
  const rawKey = process.env.CLOVER_TOKEN_ENCRYPTION_KEY;
  if (!rawKey) throw new Error("CLOVER_TOKEN_ENCRYPTION_KEY is missing");

  const key = Buffer.from(rawKey, "base64");
  if (key.length !== 32) {
    throw new Error(
      "CLOVER_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key",
    );
  }

  return key;
};

export const encryptCloverSecret = (plaintext: string): string => {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
};

export const decryptCloverSecret = (payload: string): string => {
  const [ivPart, authTagPart, encryptedPart] = payload.split(".");

  if (!ivPart || !authTagPart || !encryptedPart) {
    throw new Error("Invalid encrypted Clover secret");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(ivPart, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(authTagPart, "base64url"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, "base64url")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};
