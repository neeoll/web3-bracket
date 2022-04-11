import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

export default async(req, res) => {
    const data = JSON.parse(req.body)
    const removedBracket = await prisma.bracket.delete({ 
        where: {
            address: data.address.toString()
        }
    })
    
    res.json(removedBracket)
}