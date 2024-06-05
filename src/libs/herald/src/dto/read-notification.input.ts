import { IsInt, IsString } from "class-validator";

export class ReadNotificationInput {
  @IsString({ each: true })
  requestIds: string[];

  @IsInt()
  rcno: number;
}
