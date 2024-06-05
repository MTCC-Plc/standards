import { Module } from "@nestjs/common";
import { HeraldService } from "./herald.service";

/**
 * @baseUrl Base URL of herald API
 * @apiKey API key for herald API
 * @source Source of the notifications to be generated or fetched i.e. the name
 * of the app using this service
 * @sendNotification Meant to be used in development. If false is passed,
 * notifications will not be created. If a list of rcnos are passed, will only
 * create notifications for those employees. In production, this can be either
 * be undefined, empty string or 'true'.
 */
export interface HeraldConfig {
  baseUrl: string;
  apiKey: string;
  source: string;
  sendNotification?: string;
}

@Module({
  providers: [HeraldService],
  exports: [HeraldService],
})
export class HeraldModule {
  register(config: HeraldConfig) {
    return {
      module: HeraldModule,
      providers: [
        { provide: HeraldService, useValue: new HeraldService(config) },
      ],
      exports: [HeraldService],
    };
  }
}