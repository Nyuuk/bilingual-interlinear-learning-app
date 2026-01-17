import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const getPrisma = () => {
    if (globalForPrisma.prisma) {
        return globalForPrisma.prisma
    }

    const connectionString = `${process.env.DATABASE_URL}`
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)

    const prisma = new PrismaClient({
        adapter,
        log: ['error', 'warn'],
    })

    if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = prisma
    }

    return prisma
}

export default getPrisma
