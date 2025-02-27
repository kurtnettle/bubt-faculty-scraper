import * as esbuild from "esbuild";
import { readFileSync } from "fs";

const pkg = readFileSync("./package.json");
const pkgJson = JSON.parse(pkg);
const pkgBase64 = Buffer.from(
  JSON.stringify({
    name: pkgJson.name,
    description: pkgJson.description,
    version: pkgJson.version,
  })
).toString("base64");

esbuild
  .build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    platform: "node",
    target: ["node22"],
    outfile: `dist/bubt-faculty-scraper-v${pkgJson.version}.js`,
    minify: true,
    define: {
      "process.env.NPM_PKG_BASE64": JSON.stringify(pkgBase64),
    },
    external: ["fs", "path", "process"],
  })
  .then(() => console.log("✅ Build succeeded"))
  .catch((err) => {
    console.error("❌ Build failed:", err);
    process.exit(1);
  });
