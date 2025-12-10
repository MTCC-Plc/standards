import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import axios, { AxiosResponse } from "axios";
import {
  GetBasicResponse,
  IsPwdResponse,
  IsValidResponse,
  NapisModuleOptions,
  QueryNapisInput,
  ValidInfoInput,
} from "./napis.interface";

/**
 * Service for interacting with the Napis API.
 * Provides methods to query national identity information from various government services.
 */
@Injectable()
export class NapisService {
  constructor(private readonly config: NapisModuleOptions) {}

  /**
   * Makes a custom query to the Napis API.
   * Handles authentication and error transformation into NestJS HTTP exceptions.
   *
   * @template T - The expected response type
   * @param {QueryNapisInput} options - Query configuration options
   * @param {string} options.endpoint - The API endpoint to call (relative to host)
   * @param {string} [options.method='get'] - HTTP method to use
   * @param {any} [options.body] - Request body for POST/PUT requests
   * @param {Record<string, string>} [options.headers] - Additional headers to include
   * @param {"json" | "arraybuffer" | "text"} [options.responseType] - Expected response type
   * @returns {Promise<AxiosResponse<T, any>>} Axios response with the requested data
   * @throws {BadRequestException} When the API returns a 400 status
   * @throws {UnauthorizedException} When the API returns a 401 status
   * @throws {ForbiddenException} When the API returns a 403 status
   * @throws {NotFoundException} When the API returns a 404 status
   * @throws {InternalServerErrorException} When the API returns 5xx status or network errors occur
   * @throws {HttpException} For other HTTP error statuses
   */
  async queryNapis<T>({
    endpoint,
    method,
    body,
    headers,
    responseType = undefined,
  }: QueryNapisInput): Promise<AxiosResponse<T, any>> {
    const h = {
      Authorization: `${this.config.appKey}`,
      "Content-Type": "application/json",
      ...headers,
    };
    const result = await axios
      .request<T>({
        url: `${this.config.host}/${endpoint}`,
        method,
        headers: h,
        data: body,
        responseType,
      })
      .catch((err) => {
        if (err.response) {
          const { status, data } = err.response;
          const errorMessage = data?.error || data?.message || `Napis Error`;

          switch (status) {
            case 400:
              throw new BadRequestException(`Napis: ${errorMessage}`);
            case 401:
              throw new UnauthorizedException(`Napis: ${errorMessage}`);
            case 403:
              throw new ForbiddenException(`Napis: ${errorMessage}`);
            case 404:
              throw new NotFoundException(`Napis: ${errorMessage}`);
            case 500:
            case 502:
            case 503:
            case 504:
              throw new InternalServerErrorException(`Napis: ${errorMessage}`);
            default:
              throw new HttpException(`Napis: ${errorMessage}`, status);
          }
        } else {
          // Network error or other non-HTTP error
          throw new InternalServerErrorException(
            `Napis: ${err.message || "Network error"}`
          );
        }
      });
    return result;
  }

  /**
   * Checks if a person is registered as a Person with Disability (PWD) with NSPA.
   *
   * @param {string} nid - National ID number to check
   * @returns {Promise<IsPwdResponse>} Object containing isPwd status and optional disability type
   * @example
   * const result = await napisService.isPwd('A123456');
   * if (result.isPwd) {
   *   console.log(`PWD Type: ${result.type}`);
   * }
   */
  async isPwd(nid: string): Promise<IsPwdResponse> {
    const resp = await this.queryNapis<IsPwdResponse>({
      endpoint: `nspa/pwd?nid=${nid}`,
      method: "get",
    });
    return resp.data;
  }

  /**
   * Validates identity information against the DNR (Department of National Registration) database.
   * Checks if the provided information matches the official records.
   *
   * @param {ValidInfoInput} input - Identity information to validate
   * @param {string} input.nid - National ID number (required)
   * @param {string} [input.name] - Full name to validate
   * @param {string} [input.dob] - Date of birth to validate (format: YYYY-MM-DD)
   * @param {string} [input.atoll] - Atoll name to validate
   * @param {string} [input.island] - Island name to validate
   * @param {string} [input.home] - Home name/address to validate
   * @returns {Promise<IsValidResponse>} Validation result with isValid status, errors array, and dob if available
   * @example
   * const result = await napisService.isValid({
   *   nid: 'A123456',
   *   name: 'John Doe',
   *   dob: '1990-01-01'
   * });
   * if (!result.isValid) {
   *   console.log('Validation errors:', result.errors);
   * }
   */
  async isValid(input: ValidInfoInput): Promise<IsValidResponse> {
    const params = new URLSearchParams();
    params.append("nid", input.nid);
    if (input.name) params.append("name", input.name);
    if (input.dob) params.append("dob", input.dob);
    if (input.atoll) params.append("atoll", input.atoll);
    if (input.island) params.append("island", input.island);
    if (input.home) params.append("home", input.home);

    const resp = await this.queryNapis<IsValidResponse>({
      endpoint: `dnr/valid?${params.toString()}`,
      method: "get",
    });
    return resp.data;
  }

  /**
   * Checks if a person is over 18 years old based on their National ID.
   * Uses DNR data to determine age.
   *
   * @param {string} nid - National ID number to check
   * @returns {Promise<boolean>} True if the person is over 18, false otherwise
   * @example
   * const isAdult = await napisService.isOver18('A123456');
   * if (!isAdult) {
   *   throw new ForbiddenException('Must be 18 or older');
   * }
   */
  async isOver18(nid: string): Promise<boolean> {
    const resp = await this.queryNapis<boolean>({
      endpoint: `dnr/over18?nid=${nid}`,
      method: "get",
    });
    return resp.data;
  }

  /**
   * Retrieves basic identity information from the DNR database.
   *
   * @param {string} nid - National ID number
   * @returns {Promise<GetBasicResponse>} Basic information including name, dob, atoll, island, and home
   * @example
   * const info = await napisService.getBasic('A123456');
   * console.log(`Name: ${info.name}, DOB: ${info.dob}`);
   * console.log(`Address: ${info.home}, ${info.island}, ${info.atoll}`);
   */
  async getBasic(nid: string): Promise<GetBasicResponse> {
    const resp = await this.queryNapis<GetBasicResponse>({
      endpoint: `dnr/basic?nid=${nid}`,
      method: "get",
    });
    return resp.data;
  }
}
