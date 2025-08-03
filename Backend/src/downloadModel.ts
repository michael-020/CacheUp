import { snapshotDownload } from "@huggingface/hub";
import path from "path";
import fs from "fs-extra";

const CACHE_DIR = path.resolve(__dirname, "../.cache/huggingface");
const FLAT_DIR = path.resolve(__dirname, "../src/vectorModel/Xenova/multi-qa-MiniLM-L6-cos-v1/flat");

async function copyResolvedFiles(src: string, dest: string) {
  await fs.ensureDir(dest);
  const entries = await fs.readdir(src);

  for (const entry of entries) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    const stat = await fs.lstat(srcPath);

    if (stat.isSymbolicLink()) {
      const realPath = await fs.realpath(srcPath);
      await fs.copy(realPath, destPath);
    } else if (stat.isDirectory()) {
      await copyResolvedFiles(srcPath, path.join(dest, entry));
    } else {
      await fs.copy(srcPath, destPath);
    }
  }
}

async function downloadAndFlatten() {
  console.log("⏬ Downloading snapshot...");
  const snapshotDir = await snapshotDownload({
    repo: "Xenova/multi-qa-MiniLM-L6-cos-v1",
    cacheDir: CACHE_DIR,
  } as any);

  console.log("📦 Snapshot downloaded to:", snapshotDir);
  await copyResolvedFiles(snapshotDir, FLAT_DIR);
  console.log("✅ Flattened model saved to:", FLAT_DIR);
}

downloadAndFlatten().catch((err) => {
  console.error("❌ Flattening failed:", err);
});
