import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';

jest.mock('./shared/infra/database/database.module', () => ({
  DatabaseModule: class DatabaseModule {},
}));

jest.mock('./modules/auth/auth.module', () => ({
  AuthModule: class AuthModule {},
}));

jest.mock('./modules/users/users.module', () => ({
  UsersModule: class UsersModule {},
}));

describe('AppModule', () => {
  it('should compile', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
