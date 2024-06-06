import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
} from "class-validator";

export class SyncNotificationInput {
  @IsInt()
  sourceId: number;

  @IsDate()
  createdAt?: Date;

  @IsInt()
  @IsOptional()
  rcno?: number;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  source: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsBoolean()
  read: boolean;

  requestId?: string;
}
