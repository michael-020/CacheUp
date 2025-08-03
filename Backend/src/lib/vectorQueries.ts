import { prisma } from "./prisma"
import { toSql } from 'pgvector';

export enum TableNames {
    Forum,
    Thread,
    Post,
    Comment
}

export const insertVector = async (id: string, vector: number[], tableName: TableNames) => {

  try {
    await prisma.$executeRawUnsafe(
        `UPDATE "${TableNames[tableName]}" SET embedding = $1 WHERE id = $2`,
        vector,
        id
    );
  } catch (error) {
    console.error("Error while inserting vector", error)
  }
  
}

export const getSimilarVectors = async (vector: number[], limit: number, tableName: TableNames) => {

  try {
    const table = TableNames[tableName];
    const embedding = toSql(vector); 
    const normalizedVector = normalizeVector(vector);

    const query = `
      SELECT id, "mongoId",
        1 - (embedding <#> '${embedding}'::vector) AS certainty
      FROM "${table}"
      ORDER BY embedding <#> '${embedding}'::vector
      LIMIT ${limit}
    `;


    const results = await prisma.$queryRawUnsafe(query, vector);
    return results;
  } catch (error) {
    console.error("Error while getting vectors", error)
  }
  
}

// Normalize your input vector before querying
const normalizeVector = (vec: number[]): number[] => {
  const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? vec.map(val => val / magnitude) : vec;
};

