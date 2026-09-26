// Tiny static server with clean URLs + rebuild-on-change. No dependencies.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, watch } from "node:fs";
import { join, extname, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import config from "./site.config.mjs";

const ROOT = dirname(new URL(import.meta.url).pathname);
const DIST = join(ROOT, "dist");
const PORT = process.env.PORT || config.port;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".txt": "text/plain", ".json": "application/json", ".woff2": "font/woff2" };

function build() {
  try { execFileSync("node", [join(ROOT, "build.mjs")], { stdio: "inherit" }); }
  catch (e) { console.error("Build failed"); }
}
build();
if (!process.argv.includes("--no-watch")) {
  let t;
  for (const d of ["src", "public", "site.config.mjs"]) {
    watch(join(ROOT, d), { recursive: true }, () => { clearTimeout(t); t = setTimeout(build, 120); });
  }
}

createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (config.basePath && p.startsWith(config.basePath)) p = p.slice(config.basePath.length) || "/";
  else if (config.basePath && p === "/") { res.statusCode = 302; res.setHeader("Location", config.basePath + "/"); return res.end(); }
  let file = join(DIST, p);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  else if (!existsSync(file) && existsSync(file + ".html")) file = file + ".html";
  if (!existsSync(file)) { file = join(DIST, "404", "index.html"); res.statusCode = 404; }
  if (!existsSync(file)) { res.statusCode = 404; return res.end("Not found"); }
  res.setHeader("Content-Type", types[extname(file)] || "application/octet-stream");
  res.setHeader("Cache-Control", "no-store");
  res.end(readFileSync(file));
}).listen(PORT, () => console.log(`Rooster site -> http://localhost:${PORT}${config.basePath || ""}/`));
