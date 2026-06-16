import { randomBytes, randomUUID, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';

const scrypt = promisify(scryptCallback);

const permissions = [
  'users:create',
  'users:read',
  'users:update',
  'users:delete',
] as const;

const roles = ['admin', 'user'] as const;

type AdminSeed = {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
};

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

function getAdminSeed(): AdminSeed {
  return {
    id: process.env.ADMIN_ID ?? randomUUID(),
    name: process.env.ADMIN_NAME ?? 'Admin',
    username: process.env.ADMIN_USERNAME ?? 'admin',
    email: (process.env.ADMIN_EMAIL ?? 'admin@example.com').toLowerCase(),
    password: process.env.ADMIN_PASSWORD ?? 'change_me',
  };
}

async function seedRoles(dataSource: DataSource): Promise<void> {
  for (const role of roles) {
    await dataSource.query(
      `
        INSERT INTO roles (id, name)
        VALUES ($1, $2)
        ON CONFLICT (name) DO NOTHING
      `,
      [randomUUID(), role],
    );
  }
}

async function seedPermissions(dataSource: DataSource): Promise<void> {
  for (const permission of permissions) {
    await dataSource.query(
      `
        INSERT INTO permissions (id, name)
        VALUES ($1, $2)
        ON CONFLICT (name) DO NOTHING
      `,
      [randomUUID(), permission],
    );
  }
}

async function seedAdminUser(dataSource: DataSource): Promise<void> {
  const admin = getAdminSeed();
  const passwordHash = await hashPassword(admin.password);

  await dataSource.query(
    `
      INSERT INTO users (
        id,
        name,
        username,
        email,
        password_hash,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, true)
      ON CONFLICT (email) DO UPDATE
      SET
        name = EXCLUDED.name,
        username = EXCLUDED.username,
        is_active = true,
        updated_at = now()
    `,
    [admin.id, admin.name, admin.username, admin.email, passwordHash],
  );
}

async function seedRolePermissions(dataSource: DataSource): Promise<void> {
  await dataSource.query(`
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT roles.id, permissions.id
    FROM roles
    CROSS JOIN permissions
    WHERE roles.name = 'admin'
      AND permissions.name IN (${permissions.map((permission) => `'${permission}'`).join(', ')})
    ON CONFLICT (role_id, permission_id) DO NOTHING
  `);

  await dataSource.query(`
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT roles.id, permissions.id
    FROM roles
    INNER JOIN permissions ON permissions.name = 'users:read'
    WHERE roles.name = 'user'
    ON CONFLICT (role_id, permission_id) DO NOTHING
  `);
}

async function seedAdminRole(dataSource: DataSource): Promise<void> {
  const admin = getAdminSeed();

  await dataSource.query(
    `
      INSERT INTO user_roles (user_id, role_id)
      SELECT users.id, roles.id
      FROM users
      INNER JOIN roles ON roles.name = 'admin'
      WHERE users.email = $1
      ON CONFLICT (user_id, role_id) DO NOTHING
    `,
    [admin.email],
  );
}

async function runSeeds(): Promise<void> {
  const dataSource = await AppDataSource.initialize();

  try {
    await seedRoles(dataSource);
    await seedPermissions(dataSource);
    await seedAdminUser(dataSource);
    await seedRolePermissions(dataSource);
    await seedAdminRole(dataSource);
  } finally {
    await dataSource.destroy();
  }
}

void runSeeds();
