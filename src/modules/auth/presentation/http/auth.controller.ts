import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { CurrentUser } from '../../infra/http/decorators/current-user.decorator';
import { Public } from '../../infra/http/decorators/public.decorator';
import type { CurrentUser as CurrentUserType } from '../../infra/http/types/current-user';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { LoginDto } from './dtos/login.dto';
import { LogoutDto } from './dtos/logout.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Public()
  @Post('login')
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() body: LoginDto): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(body);
  }

  @Public()
  @Post('refresh')
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
  async refresh(@Body() body: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.refreshTokenUseCase.execute(body);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Refresh token revoked' })
  async logout(@Body() body: LogoutDto): Promise<void> {
    await this.logoutUseCase.execute(body);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Authenticated user' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token' })
  me(@CurrentUser() user: CurrentUserType): CurrentUserType {
    return user;
  }
}
