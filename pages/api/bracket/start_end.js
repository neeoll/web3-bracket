import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

export default async(req, res) => {
    const data = JSON.parse(req.body)
    const updatedBracket = await prisma.bracket.update({ 
        where: {
            address: data.address.toString()
        },
        data: {
            started: data.started
        }
    })
    
    res.json(updatedBracket)
}