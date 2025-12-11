/**
 * Configuration options for NapisModule.
 */
export interface NapisModuleOptions {
  /** Base URL of the Napis API service */
  host: string;
  /** Optional API key for authentication */
  appKey?: string;
  /** Enable mock mode for testing purposes */
  mock?: boolean;
}

/**
 * Async configuration options for NapisModule using factory pattern.
 */
export interface NapisModuleAsyncOptions {
  /** Modules to import that are required by the factory */
  imports?: any[];
  /** Providers to inject into the factory function */
  inject?: any[];
  /** Factory function that returns NapisModuleOptions */
  useFactory?: (
    ...args: unknown[]
  ) => NapisModuleOptions | Promise<NapisModuleOptions>;
}

/**
 * Response from the isPwd endpoint.
 */
export interface IsPwdResponse {
  /** Whether the person is registered as PWD */
  isPwd: boolean;
  /** Type/category of disability if registered as PWD */
  type?: string;
}

/**
 * Response from the isValid endpoint.
 */
export interface IsValidResponse {
  /** Whether the provided information is valid */
  isValid: boolean;
  /** Array of error codes if validation failed */
  errors?: number[];
  /** Date of birth from DNR records */
  dob?: string;
}

/**
 * Response from the isOver18 endpoint.
 */
export interface IsOver18Response {
  /** Whether the person is over 18 years old */
  isOver18: boolean;
}

/**
 * Basic identity information from DNR.
 */
export interface GetBasicResponse {
  /** Full name of the person */
  name: string;
  /** Date of birth (format: YYYY-MM-DD) */
  dob: string;
  /** Atoll of residence */
  atoll: string;
  /** Island of residence */
  island: string;
  /** Home name/address */
  home: string;
}

/**
 * Input for validating identity information.
 */
export interface ValidInfoInput {
  /** National ID number (required) */
  nid: string;
  /** Full name to validate against DNR records */
  name?: string;
  /** Date of birth to validate (format: YYYY-MM-DD) */
  dob?: string;
  /** Atoll name to validate */
  atoll?: string;
  /** Island name to validate */
  island?: string;
  /** Home name/address to validate */
  home?: string;
}

/**
 * Input configuration for custom Napis API queries.
 */
export interface QueryNapisInput {
  /** API endpoint path (relative to host) */
  endpoint: string;
  /** HTTP method (default: 'get') */
  method?: string;
  /** Request body for POST/PUT requests */
  body?: any;
  /** Additional HTTP headers */
  headers?: Record<string, string>;
  /** Expected response type */
  responseType?: "json" | "arraybuffer" | "text";
}
