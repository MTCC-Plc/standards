import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export default class NoCountConnectionArgs {
  @Field(() => Int, {
    nullable: true,
  })
  after?: number;

  @Field(() => Int, { nullable: true })
  first?: number;
}
