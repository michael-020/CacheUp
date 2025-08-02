import { pipeline, env } from "@huggingface/transformers";
import path from "path";

export async function embedtext(input: string): Promise<number[]> {
  env.allowRemoteModels = false;

  const modelPath = path.resolve(
    __dirname,
    "../vectorModel/Xenova/multi-qa-MiniLM-L6-cos-v1/flat"
  );

  const extractor = await pipeline("feature-extraction", modelPath, {
    pooling: "mean",       
    normalize: true        
  } as any);

  const vector = (await extractor([input])).tolist()[0];
  return vector as number[];
}
