import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { NOTIFICATION_SCOPE_NAMES } from "../constants";

export class CreateNotificationInput {
  @IsArray()
  @ValidateNested()
  recipients: NotificationRecipientInput[];

  @IsString()
  source?: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  emailHtml?: string;

  @IsArray()
  @IsIn(NOTIFICATION_SCOPE_NAMES, { each: true })
  @IsOptional()
  scopes?: string[] = [];

  @IsBoolean()
  @IsOptional()
  sendAllScopes?: boolean = false;
}

export class NotificationRecipientInput {
  @IsInt()
  @IsOptional()
  rcno?: number;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  flaggedForFetch?: boolean = false;

  scopes?: NotificationRecipientScope[];
}

export class NotificationRecipientScope {
  name: string;
  sent: boolean;
  error: boolean;
}
