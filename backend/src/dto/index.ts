/**
 * Data Transfer Objects (DTOs)
 *
 * DTOs are used to:
 * 1. Prevent leaking sensitive data (passwords, tokens, internal fields)
 * 2. Standardize API response shapes
 * 3. Decouple internal data models from external API contracts
 *
 * Usage:
 * - Use toDTO() methods to transform model instances to DTOs
 * - Use fromDTO() methods to transform incoming data to model format
 */

export * from "./user.dto";
export * from "./product.dto";
export * from "./category.dto";
export * from "./cart.dto";
export * from "./order.dto";
export * from "./common.dto";
