import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { asText, chooseCover } from "../src/core/index.ts";

const inputPath = process.argv[2] || "tmp/g.json";
const outputPath = process.argv[3] || "public/data/search-index.json";

function toSearchItem(item) {
  if (!Array.isArray(item)) return null;
  const id = asText(item[0]);
  if (!id) return null;
  return {
    id,
    cn: asText(item[1]),
    alias: asText(item[2]),
    title: asText(item[3]),
    city: asText(item[4]),
    cover: chooseCover(item[15], item[6]),
    pointsLength: Array.isArray(item[12]) ? Math.floor(item[12].length / 4) : Number(item[13]) || 0
  };
}

const raw = JSON.parse(readFileSync(inputPath, "utf8"));
const source = Array.isArray(raw && raw[0]) ? raw[0] : raw;
if (!Array.isArray(source)) {
  throw new TypeError("Expected g.json to contain an array search index");
}

const items = source.map(toSearchItem).filter(Boolean);
const payload = {
  version: 1,
  generatedAt: new Date().toISOString(),
  source: "https://www.anitabi.cn/d/g.json",
  items
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(payload), "utf8");

const inputBytes = Buffer.byteLength(JSON.stringify(raw));
const outputBytes = Buffer.byteLength(JSON.stringify(payload));
console.log(`search index: ${items.length} items, ${inputBytes} -> ${outputBytes} bytes`);
