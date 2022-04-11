import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default async(req, res) => {
    const data = JSON.parse(req.body)
    const createdEntrant = await prisma.entrant.create({
        data: {
            address: data.address,
            name: data.name,
            bracketAddress: data.bracketAddress
        },
        include: {
            bracket: true
        }
    })
    res.json(createdEntrant)
}