type EnvironmentVariables = Record<string, string | undefined>;

const requiredVariables = [
  'NODE_ENV',
  'PORT',
  'DATABASE_HOST',
  'DATABASE_PORT',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'DATABASE_NAME',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
] as const;

const validNodeEnvs = ['development', 'test', 'production'] as const;

export function validateEnv(
  config: EnvironmentVariables,
): EnvironmentVariables {
  const missingVariables = requiredVariables.filter((key) => !config[key]);

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(', ')}`,
    );
  }

  if (
    !validNodeEnvs.includes(config.NODE_ENV as (typeof validNodeEnvs)[number])
  ) {
    throw new Error(
      `Invalid NODE_ENV. Expected one of: ${validNodeEnvs.join(', ')}`,
    );
  }

  const port = Number(config.PORT);
  const databasePort = Number(config.DATABASE_PORT);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer');
  }

  if (!Number.isInteger(databasePort) || databasePort <= 0) {
    throw new Error('DATABASE_PORT must be a positive integer');
  }

  return config;
}
