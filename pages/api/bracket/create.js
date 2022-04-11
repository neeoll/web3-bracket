import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

export default async(req, res) => {
    const data = JSON.parse(req.body)
    const createdBracket = await prisma.bracket.create({ data })
    res.json(createdBracket)
}