import { snapshotDownload } from "@huggingface/hub";
import path from "path";

async function downloadModel(): Promise<void> {
  try {
    const dir = await snapshotDownload({
      repo: "Xenova/multi-qa-MiniLM-L6-cos-v1",
      cacheDir: path.resolve("./models/multi-qa-MiniLM-L6-cos-v1"),
    });

    console.log("✅ Model downloaded to:", dir);
  } catch (error) {
    console.error("❌ Failed to download model:", error);
  }
}

downloadModel();
