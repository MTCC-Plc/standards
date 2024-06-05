import { ArgsType, Field } from "@nestjs/graphql";
import NoCountConnectionArgs from "../../../../utils/pagination";

@ArgsType()
export class NotificationConnectionArgs extends NoCountConnectionArgs {
  @Field({ nullable: true })
  rcno?: number;

  @Field({ nullable: true })
  from?: Date;

  @Field({ nullable: true })
  to?: Date;

  @Field({ nullable: true })
  source?: string;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  url?: string;
}
