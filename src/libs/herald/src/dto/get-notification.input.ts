import { Field, InputType } from "@nestjs/graphql";
import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, IsString } from "class-validator";

@InputType()
export class GetNotificationInput {
  @Field()
  @IsString()
  @Transform((value: { value: string }) => value.value.trim().toLowerCase())
  source: string;

  @Field({ nullable: true })
  @Type(() => Number)
  @IsOptional()
  rcno?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;

  @Field({ nullable: true })
  @Transform(({ value }) => value === "true")
  @IsOptional()
  read?: boolean;

  @Field({ nullable: true })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  beforeId?: number;
}
