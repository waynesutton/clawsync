import { components } from "./_generated/api";
import {
  exposeUploadApi,
  exposeDeploymentQuery,
} from "@convex-dev/self-static-hosting";

// Internal functions for secure uploads (CLI only, not public)
export const { generateUploadUrl, recordAsset, gcOldAssets, listAssets } =
  exposeUploadApi(components.selfStaticHosting);

// Public query for deployment tracking
export const { getCurrentDeployment } =
  exposeDeploymentQuery(components.selfStaticHosting);
