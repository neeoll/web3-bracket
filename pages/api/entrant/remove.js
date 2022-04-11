import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default async(req, res) => {
    const data = JSON.parse(req.body)
    const deletedEntrant = await prisma.entrant.delete({
        where: {
            address: data.address
        }
    })
    res.json(deletedEntrant)
}