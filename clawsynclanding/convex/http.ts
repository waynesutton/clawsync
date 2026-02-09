import { httpRouter } from "convex/server";
import { registerStaticRoutes } from "@convex-dev/self-static-hosting";
import { components } from "./_generated/api";

const http = httpRouter();

// Serve static landing page files with SPA fallback
registerStaticRoutes(http, components.selfStaticHosting, {
  spaFallback: true,
});

export default http;
