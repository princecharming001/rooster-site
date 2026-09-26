// Zero-dependency static site builder.
// src/pages/**/*.html  -> dist/<path>/index.html  (wrapped in src/layout.html)
// public/**            -> dist/**
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, cpSync, rmSync, existsSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import config from "./site.config.mjs";

const ROOT = dirname(new URL(import.meta.url).pathname);
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "dist");

const layout = readFileSync(join(SRC, "layout.html"), "utf8");
const partials = {};
for (const f of readdirSync(join(SRC, "partials"))) {
  partials[f.replace(/\.html$/, "")] = readFileSync(join(SRC, "partials", f), "utf8");
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

function parseMeta(html) {
  const m = html.match(/^<!--\s*meta\s*(\{[\s\S]*?\})\s*-->/);
  if (!m) return [{}, html];
  return [JSON.parse(m[1]), html.slice(m[0].length)];
}

function expand(html, ctx) {
  // {{chick}} / {{chick:extra classes}}
  html = html.replace(/\{\{chick(?::([^}]*))?\}\}/g, (_, cls) =>
    partials.chick.replace("__CLASS__", cls ? cls.trim() : ""));
  // {{include:name}}
  html = html.replace(/\{\{include:([a-z0-9_-]+)\}\}/g, (_, n) => {
    if (!partials[n]) throw new Error("Missing partial " + n);
    return expand(partials[n], ctx);
  });
  // {{key}} from ctx + config
  html = html.replace(/\{\{([a-zA-Z0-9_.]+)\}\}/g, (m, k) => {
    if (k in ctx) return ctx[k];
    if (k in config) return config[k];
    return m;
  });
  return html;
}

rmSync(OUT, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
mkdirSync(OUT, { recursive: true });
cpSync(join(ROOT, "public"), OUT, { recursive: true });

const pages = walk(join(SRC, "pages"));
let count = 0;
for (const file of pages) {
  const rel = relative(join(SRC, "pages"), file).split(sep).join("/");
  const urlPath = rel === "index.html" ? "/" : "/" + rel.replace(/(^|\/)index\.html$/, "").replace(/\.html$/, "") + "/";
  const [meta, body] = parseMeta(readFileSync(file, "utf8"));
  const ctx = {
    path: urlPath,
    title: meta.title ? `${meta.title} — ${config.name}` : `${config.name} — ${config.tagline}`,
    pageTitle: meta.title || config.name,
    description: meta.description || config.description,
    bodyClass: meta.bodyClass || "",
    section: meta.section || "",
    content: "", // filled below
  };
  ctx.content = expand(body, ctx);
  let html = expand(layout, ctx);
  if (config.basePath) html = html.replace(/(href|src)="\/(?!\/)/g, `$1="${config.basePath}/`);
  const outFile = urlPath === "/" ? join(OUT, "index.html") : join(OUT, urlPath.slice(1), "index.html");
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, html);
  count++;
}
// Simple sitemap
const urls = pages.map(f => {
  const rel = relative(join(SRC, "pages"), f).split(sep).join("/");
  return rel === "index.html" ? "/" : "/" + rel.replace(/(^|\/)index\.html$/, "").replace(/\.html$/, "") + "/";
});
writeFileSync(join(OUT, "sitemap.txt"), urls.map(u => `https://${config.domain}${config.basePath || ""}${u}`).join("\n"));
console.log(`Built ${count} pages -> dist/`);
