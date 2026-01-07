/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminUsers from "../adminUsers.js";
import type * as customers from "../customers.js";
import type * as files from "../files.js";
import type * as galleryPhotos from "../galleryPhotos.js";
import type * as inquiries from "../inquiries.js";
import type * as litters from "../litters.js";
import type * as parentDogs from "../parentDogs.js";
import type * as puppies from "../puppies.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminUsers: typeof adminUsers;
  customers: typeof customers;
  files: typeof files;
  galleryPhotos: typeof galleryPhotos;
  inquiries: typeof inquiries;
  litters: typeof litters;
  parentDogs: typeof parentDogs;
  puppies: typeof puppies;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
