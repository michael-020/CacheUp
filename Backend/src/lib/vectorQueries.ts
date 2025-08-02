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
    const items = await prisma.$queryRaw`
        SELECT id, mongoId
        FROM ${TableNames[tableName]}
        ORDER BY embedding <-> ${vector}::vector
        LIMIT ${limit}
    `

    return items
  } catch (error) {
    console.error("Error while getting vectors", error)
  }
  
}