const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "node_modules", "source-map", "lib", "read-wasm.js");
const from = 'if (typeof fetch === "function") {';
const to = 'if (typeof fetch === "function" && typeof window !== "undefined") {';
const noPatchNeeded = 'const fs = require("fs");';

if (!fs.existsSync(file)) {
  console.log("source-map not installed; skipping patch");
  process.exit(0);
}

const source = fs.readFileSync(file, "utf8");

if (source.includes(to)) {
  console.log("source-map already patched for Node 22");
  process.exit(0);
}

if (source.includes(noPatchNeeded) && !source.includes(from)) {
  console.log("source-map already uses the Node read-wasm path; no patch needed");
  process.exit(0);
}

if (!source.includes(from)) {
  throw new Error("Unexpected source-map read-wasm.js contents");
}

const next = source.replace(
  from,
  `${to}\n  // ponytail: old source-map mistakes Node 18+/22 global fetch for a browser; delete when Fitbit updates this dependency.`
);

if (!next.includes(to)) {
  throw new Error("Failed to patch source-map read-wasm.js");
}

fs.writeFileSync(file, next);
console.log("Patched source-map for Node 22 compatibility");
