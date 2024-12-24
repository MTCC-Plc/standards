import { Inject } from "@nestjs/common";
import { SEARCH_CLIENT } from "./constants";

export function InjectSearch() {
  return Inject(SEARCH_CLIENT);
}
