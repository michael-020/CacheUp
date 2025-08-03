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
    normalize: true,
    dtype: 'fp32'      
  } as any);

  const vector = (await extractor([input])).tolist()[0];
  const result = meanPool(vector)
  return result
}

function meanPool(vectors: number[][]): number[] {
  const numVectors = vectors.length;
  const dim = vectors[0].length;
  const sum = new Array(dim).fill(0);

  for (const vec of vectors) {
    for (let i = 0; i < dim; i++) {
      sum[i] += vec[i];
    }
  }

  return sum.map(x => x / numVectors);
}

