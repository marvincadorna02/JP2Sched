// Temp: exercise the real handler against Gemini with a REAL ERC photo.
import fs from "node:fs";
import handler from "./api/erc_scan.js";

const envText = fs.readFileSync(".env", "utf8");
for (const line of envText.split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const image = fs.readFileSync("test-erc.jpg").toString("base64");

const req = { method: "POST", body: { image, mimeType: "image/jpeg" } };
const res = {
  statusCode: 200,
  status(c) { this.statusCode = c; return this; },
  json(o) {
    console.log("STATUS:", this.statusCode);
    console.log("BODY:", JSON.stringify(o, null, 2));
    return this;
  },
  setHeader() {}, end() {},
};

console.log("model:", process.env.GEMINI_MODEL || "gemini-3.1-flash-lite (default)");
console.log("image bytes:", image.length);
await handler(req, res);
