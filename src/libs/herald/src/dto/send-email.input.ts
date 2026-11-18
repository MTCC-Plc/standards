import { IsBoolean, IsOptional, IsString } from "class-validator";

export class SendEmailInput {
  @IsString()
  email: string;

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

  // Sends through Herald's priority queue. Only for time-sensitive messages
  // such as OTPs.
  @IsBoolean()
  @IsOptional()
  priority?: boolean;
}
