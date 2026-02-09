import { defineApp } from "convex/server";
import selfStaticHosting from "@convex-dev/self-static-hosting/convex.config.js";

const app = defineApp();

// Self-hosting for static landing page
app.use(selfStaticHosting);

export default app;
