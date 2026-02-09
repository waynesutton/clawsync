/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as http from "../http.js";
import type * as staticHosting from "../staticHosting.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  http: typeof http;
  staticHosting: typeof staticHosting;
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

export declare const components: {
  selfStaticHosting: {
    lib: {
      gcOldAssets: FunctionReference<
        "mutation",
        "internal",
        { currentDeploymentId: string },
        Array<string>
      >;
      generateUploadUrl: FunctionReference<"mutation", "internal", {}, string>;
      getByPath: FunctionReference<
        "query",
        "internal",
        { path: string },
        {
          _creationTime: number;
          _id: string;
          contentType: string;
          deploymentId: string;
          path: string;
          storageId: string;
        } | null
      >;
      getCurrentDeployment: FunctionReference<
        "query",
        "internal",
        {},
        {
          _creationTime: number;
          _id: string;
          currentDeploymentId: string;
          deployedAt: number;
        } | null
      >;
      listAssets: FunctionReference<
        "query",
        "internal",
        { limit?: number },
        Array<{
          _creationTime: number;
          _id: string;
          contentType: string;
          deploymentId: string;
          path: string;
          storageId: string;
        }>
      >;
      recordAsset: FunctionReference<
        "mutation",
        "internal",
        {
          contentType: string;
          deploymentId: string;
          path: string;
          storageId: string;
        },
        string | null
      >;
      setCurrentDeployment: FunctionReference<
        "mutation",
        "internal",
        { deploymentId: string },
        null
      >;
    };
  };
};
