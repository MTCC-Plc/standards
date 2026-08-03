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

// An adaptive card, given either as the card JSON object or as a JSON string of
// it. See https://adaptivecards.io/designer for the schema.
export type AdaptiveCard = Record<string, any> | string;

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

  @IsString()
  @IsOptional()
  emailSubject?: string;

  // Only rendered by the teams scope. Every other scope falls back to `message`,
  // which is also what is stored in the notification log, so it stays required.
  @IsOptional()
  adaptiveCard?: AdaptiveCard;

  @IsArray()
  @IsIn(NOTIFICATION_SCOPE_NAMES, { each: true })
  @IsOptional()
  scopes?: string[] = [];

  @IsBoolean()
  @IsOptional()
  sendAllScopes?: boolean = false;

  @IsBoolean()
  @IsOptional()
  ignoreLimit?: boolean = false;
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
