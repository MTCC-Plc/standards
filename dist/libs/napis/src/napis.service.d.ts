import { AxiosResponse } from "axios";
import { GetBasicResponse, IsPwdResponse, IsValidResponse, NapisModuleOptions, QueryNapisInput, ValidInfoInput } from "./napis.interface";
/**
 * Service for interacting with the Napis API.
 * Provides methods to query national identity information from various government services.
 */
export declare class NapisService {
    private readonly config;
    constructor(config: NapisModuleOptions);
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
    queryNapis<T>({ endpoint, method, body, headers, responseType, }: QueryNapisInput): Promise<AxiosResponse<T, any>>;
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
    isPwd(nid: string): Promise<IsPwdResponse>;
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
    isValid(input: ValidInfoInput): Promise<IsValidResponse>;
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
    isOver18(nid: string): Promise<boolean>;
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
    getBasic(nid: string): Promise<GetBasicResponse>;
}
