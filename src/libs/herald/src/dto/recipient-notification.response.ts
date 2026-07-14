import { GetNotificationInput } from "./get-notification.input";

/**
 * The herald API requires a source, but `HeraldService` defaults it to the
 * source configured on the module, so callers of the client only pass it when
 * acting on behalf of another app.
 */
export type GetNotificationClientInput = Omit<GetNotificationInput, "source"> & {
  source?: string;
};

export interface RecipientNotification {
  id: number;
  createdAt: Date;
  requestId: string;
  source: string;
  message: string;
  url?: string;
  rcno?: number;
  read: boolean;
}
