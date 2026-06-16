import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthSchema1718568000000 implements MigrationInterface {
  name = 'CreateAuthSchema1718568000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id uuid NOT NULL,
        name varchar(255) NOT NULL,
        username varchar(100) NOT NULL,
        email varchar(255) NOT NULL,
        password_hash varchar(255) NOT NULL,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now(),
        deleted_at timestamp NULL,
        CONSTRAINT pk_users PRIMARY KEY (id),
        CONSTRAINT uq_users_username UNIQUE (username),
        CONSTRAINT uq_users_email UNIQUE (email)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE roles (
        id uuid NOT NULL,
        name varchar(100) NOT NULL,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now(),
        CONSTRAINT pk_roles PRIMARY KEY (id),
        CONSTRAINT uq_roles_name UNIQUE (name)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE permissions (
        id uuid NOT NULL,
        name varchar(100) NOT NULL,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now(),
        CONSTRAINT pk_permissions PRIMARY KEY (id),
        CONSTRAINT uq_permissions_name UNIQUE (name)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE user_roles (
        user_id uuid NOT NULL,
        role_id uuid NOT NULL,
        created_at timestamp NOT NULL DEFAULT now(),
        CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role_id),
        CONSTRAINT fk_user_roles_user_id FOREIGN KEY (user_id)
          REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_user_roles_role_id FOREIGN KEY (role_id)
          REFERENCES roles (id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE role_permissions (
        role_id uuid NOT NULL,
        permission_id uuid NOT NULL,
        created_at timestamp NOT NULL DEFAULT now(),
        CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id),
        CONSTRAINT fk_role_permissions_role_id FOREIGN KEY (role_id)
          REFERENCES roles (id) ON DELETE CASCADE,
        CONSTRAINT fk_role_permissions_permission_id FOREIGN KEY (permission_id)
          REFERENCES permissions (id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE refresh_tokens (
        id uuid NOT NULL,
        user_id uuid NOT NULL,
        token_hash varchar(255) NOT NULL,
        expires_at timestamp NOT NULL,
        revoked_at timestamp NULL,
        created_at timestamp NOT NULL DEFAULT now(),
        CONSTRAINT pk_refresh_tokens PRIMARY KEY (id),
        CONSTRAINT uq_refresh_tokens_token_hash UNIQUE (token_hash),
        CONSTRAINT fk_refresh_tokens_user_id FOREIGN KEY (user_id)
          REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX idx_refresh_tokens_user_id');
    await queryRunner.query('DROP TABLE refresh_tokens');
    await queryRunner.query('DROP TABLE role_permissions');
    await queryRunner.query('DROP TABLE user_roles');
    await queryRunner.query('DROP TABLE permissions');
    await queryRunner.query('DROP TABLE roles');
    await queryRunner.query('DROP TABLE users');
  }
}
