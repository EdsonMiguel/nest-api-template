import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { FindUserByIdUseCase } from '../../application/use-cases/find-user-by-id.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { CreateUserDto } from './dtos/create-user.dto';
import { ListUsersQueryDto } from './dtos/list-users-query.dto';
import { UserResponseDto, UserResponseMapper } from './dtos/user-response.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token' })
  async create(@Body() body: CreateUserDto): Promise<UserResponseDto> {
    const { user } = await this.createUserUseCase.execute(body);

    return UserResponseMapper.fromDomain(user);
  }

  @Get()
  @ApiOkResponse({ description: 'Paginated users list' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token' })
  async list(@Query() query: ListUsersQueryDto) {
    const result = await this.listUsersUseCase.execute({
      page: query.page,
      perPage: query.perPage,
    });

    return {
      ...result,
      data: result.data.map((user) => UserResponseMapper.fromDomain(user)),
    };
  }

  @Get(':id')
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token' })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    const { user } = await this.findUserByIdUseCase.execute({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserResponseMapper.fromDomain(user);
  }
}
