import { IsOptional, IsString } from "class-validator";

export class SendEmailInput {
  @IsString()
  email: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  emailHtml?: string;

  @IsString()
  @IsOptional()
  emailSubject?: string;
}
