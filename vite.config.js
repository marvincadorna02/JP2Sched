import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// In production (Vercel) the files in /api are real serverless functions.
// `npm run dev` (plain Vite) does NOT run them, so the ERC scan would 404.
// This dev-only plugin runs the same api/erc_scan.js handler inside the Vite
// dev server, so `npm run dev` behaves like production for the scan too.
// It only applies to `serve` (dev); the production build is untouched.
function apiDevServer() {
  return {
    name: "api-dev-server",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || "").split("?")[0];
        if (!url.startsWith("/api/erc_scan")) return next();

        // Collect the JSON body (Vite/connect doesn't parse it for us).
        const body = await new Promise((resolve) => {
          let data = "";
          req.on("data", (c) => (data += c));
          req.on("end", () => {
            try {
              resolve(data ? JSON.parse(data) : {});
            } catch {
              resolve({});
            }
          });
          req.on("error", () => resolve({}));
        });
        req.body = body;

        // Minimal shim so the Vercel-style handler's res.status().json() works
        // on top of the raw Node response.
        const shim = {
          status(code) {
            res.statusCode = code;
            return this;
          },
          json(obj) {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(obj));
            return this;
          },
          setHeader(k, v) {
            res.setHeader(k, v);
            return this;
          },
          end(x) {
            res.end(x);
            return this;
          },
        };

        try {
          // ssrLoadModule picks up edits to the handler without a restart.
          const mod = await server.ssrLoadModule("/api/erc_scan.js");
          await mod.default(req, shim);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Dev API error", detail: String(err) }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load .env so the dev API handler can read GEMINI_API_KEY from process.env.
  // These stay server-side — they are NOT exposed to the browser (only VITE_*
  // vars reach import.meta.env), so the key never ships in the client bundle.
  const env = loadEnv(mode, process.cwd(), "");
  if (env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  if (env.GEMINI_MODEL) process.env.GEMINI_MODEL = env.GEMINI_MODEL;

  return {
    plugins: [react(), apiDevServer()],
  };
});
