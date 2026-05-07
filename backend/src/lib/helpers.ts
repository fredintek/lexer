import * as crypto from 'crypto';

export const converDayToMilliseconds = (num: number): number =>
  num * 24 * 60 * 60 * 1000;

export const addMinuitesToCurrentTime = (mins: number): number => {
  const now = new Date();
  const minsToMilliseconds = mins * 60 * 1000;
  const later = new Date(now.getTime() + minsToMilliseconds).getTime();

  return later;
};

export const removeMinuitesFromCurrentTime = (mins: number): number => {
  const now = new Date();
  const minsToMilliseconds = mins * 60 * 1000;
  const before = new Date(now.getTime() - minsToMilliseconds).getTime();

  return before;
};

export const isDateExpired = (date?: Date | null | undefined): boolean => {
  if (!date) {
    return true;
  } else if (date < new Date()) {
    return true;
  } else {
    return false;
  }
};

export const localizeDate = (date: Date): string => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

// ================ ENCRYPTION LOGIC ====================
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

export function encrypt(text: string, key: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key!), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  // Return IV and encrypted data together so we can decrypt it later
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string, key: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key!), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    // 0 = Sunday, 6 = Saturday
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      added++;
    }
  }
  return result;
}
