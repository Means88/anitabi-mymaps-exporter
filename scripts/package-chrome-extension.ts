import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, sep } from "node:path";
import { deflateRawSync } from "node:zlib";

interface ZipEntry {
  name: string;
  data: Buffer;
  compressedData: Buffer;
  date: Date;
  crc: number;
  localOffset: number;
}

const ROOT = process.cwd();
const PACKAGE_JSON = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8")) as { name: string; version: string };
const OUT_DIR = join(ROOT, "chrome-extension-zips");
const OUT_FILE = join(OUT_DIR, `${PACKAGE_JSON.name}-${PACKAGE_JSON.version}.zip`);
const ZIP_VERSION = 20;
const UTF8_FLAG = 0x0800;
const DEFLATE_METHOD = 8;

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let index = 0; index < table.length; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
}

const CRC_TABLE = makeCrcTable();

function crc32(data: Buffer) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date: Date) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosDate, dosTime };
}

function normalizeZipPath(path: string) {
  return path.split(sep).join("/");
}

async function collectFiles(path: string) {
  const current = await stat(path);
  if (current.isFile()) return [path];
  const children = await readdir(path);
  const nested = await Promise.all(children.map((child) => collectFiles(join(path, child))));
  return nested.flat();
}

function localHeader(entry: ZipEntry, nameBuffer: Buffer) {
  const { dosDate, dosTime } = dosDateTime(entry.date);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(ZIP_VERSION, 4);
  header.writeUInt16LE(UTF8_FLAG, 6);
  header.writeUInt16LE(DEFLATE_METHOD, 8);
  header.writeUInt16LE(dosTime, 10);
  header.writeUInt16LE(dosDate, 12);
  header.writeUInt32LE(entry.crc, 14);
  header.writeUInt32LE(entry.compressedData.length, 18);
  header.writeUInt32LE(entry.data.length, 22);
  header.writeUInt16LE(nameBuffer.length, 26);
  header.writeUInt16LE(0, 28);
  return header;
}

function centralHeader(entry: ZipEntry, nameBuffer: Buffer) {
  const { dosDate, dosTime } = dosDateTime(entry.date);
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(ZIP_VERSION, 4);
  header.writeUInt16LE(ZIP_VERSION, 6);
  header.writeUInt16LE(UTF8_FLAG, 8);
  header.writeUInt16LE(DEFLATE_METHOD, 10);
  header.writeUInt16LE(dosTime, 12);
  header.writeUInt16LE(dosDate, 14);
  header.writeUInt32LE(entry.crc, 16);
  header.writeUInt32LE(entry.compressedData.length, 20);
  header.writeUInt32LE(entry.data.length, 24);
  header.writeUInt16LE(nameBuffer.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(entry.localOffset, 42);
  return header;
}

function endOfCentralDirectory(entryCount: number, centralSize: number, centralOffset: number) {
  const header = Buffer.alloc(22);
  header.writeUInt32LE(0x06054b50, 0);
  header.writeUInt16LE(0, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(entryCount, 8);
  header.writeUInt16LE(entryCount, 10);
  header.writeUInt32LE(centralSize, 12);
  header.writeUInt32LE(centralOffset, 16);
  header.writeUInt16LE(0, 20);
  return header;
}

async function buildEntries() {
  const sourceFiles = [join(ROOT, "manifest.json"), ...(await collectFiles(join(ROOT, "dist")))];
  const entries: ZipEntry[] = [];
  let localOffset = 0;

  for (const sourceFile of sourceFiles.sort()) {
    const data = await readFile(sourceFile);
    const compressedData = deflateRawSync(data, { level: 9 });
    const metadata = await stat(sourceFile);
    const name = sourceFile.endsWith("manifest.json") ? basename(sourceFile) : normalizeZipPath(relative(ROOT, sourceFile));
    const nameBuffer = Buffer.from(name);
    const entry = { name, data, compressedData, date: metadata.mtime, crc: crc32(data), localOffset };
    localOffset += 30 + nameBuffer.length + compressedData.length;
    entries.push(entry);
  }

  return entries;
}

async function main() {
  const entries = await buildEntries();
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.name);
    localParts.push(localHeader(entry, nameBuffer), nameBuffer, entry.compressedData);
    centralParts.push(centralHeader(entry, nameBuffer), nameBuffer);
  }

  const localData = Buffer.concat(localParts);
  const centralData = Buffer.concat(centralParts);
  const zipData = Buffer.concat([
    localData,
    centralData,
    endOfCentralDirectory(entries.length, centralData.length, localData.length)
  ]);

  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, zipData);
  console.log(`Created ${relative(ROOT, OUT_FILE)} (${entries.length} files, ${zipData.length} bytes)`);
}

await main();
