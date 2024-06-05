import { Module } from "@nestjs/common";
import { HeraldService } from "./herald.service";

export interface Config {
  apiUrl: string;
  apiKey: string;
}

@Module({
  providers: [HeraldService],
  exports: [HeraldService],
})
export class HeraldModule {}
