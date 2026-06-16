import { registerAs } from '@nestjs/config';

const parseCorsOrigins = (value?: string): string[] | boolean => {
  if (!value || value === '*') {
    return true;
  }

  return value.split(',').map((origin) => origin.trim());
};

export const securityConfig = registerAs('security', () => ({
  cors: {
    origin: parseCorsOrigins(process.env.CORS_ORIGIN),
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  throttler: {
    ttl: Number(process.env.THROTTLE_TTL ?? 60),
    limit: Number(process.env.THROTTLE_LIMIT ?? 100),
  },
}));
