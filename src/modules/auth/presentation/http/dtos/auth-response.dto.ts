import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../../../users/presentation/http/dtos/user-response.dto';

export class AuthResponseDto {
  @ApiProperty({ example: 'access.jwt.token' })
  accessToken!: string;

  @ApiProperty({ example: 'opaque-refresh-token' })
  refreshToken!: string;

  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;
}
