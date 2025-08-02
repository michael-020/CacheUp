import { PrismaClient } from "../../src/generated/prisma";

export const prisma = new PrismaClient()

// export const disconnectDB = async () => {
//     try {
//         await prisma.$disconnect()
//     } catch (error) {
//         console.error(error)
//         await prisma.$disconnect()
//         process.exit(1)
//     }
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })