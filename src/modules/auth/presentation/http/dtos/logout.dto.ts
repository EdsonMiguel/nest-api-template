import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutDto {
  @ApiProperty({ example: 'opaque-refresh-token' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
