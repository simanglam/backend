import { NextFunction, Router, Request, Response, request } from "express"
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.post("/chatrooms", async (req, res) => {
    if (req.session.data === undefined || req.session.data.login == false) { return }
    let data = await prisma.chatRoom.findFirst({
        where: {
            name: req.body.name,
            description: req.body.description,
        }
    })
    if (data != null) {
        res.sendStatus(400)
        return
    }
    await prisma.chatRoom.create({
        data: {
            name: req.body.name,
            description: req.body.description,
            users: {
                connect: {
                    userId: req.session.data.id
                }
            }
        }
    })
    res.sendStatus(200)
})

router.get('/chatrooms', async(req, res) => {
    if(req.session.data === undefined){ return}
    let data = await prisma.user.findMany({
        where: {
            userId: req.session.data.id
        },
        select: {
            chatRooms: {
                select: {
                    description: true,
                    name: true
                }
            }
        }
    })
    res.json(data)
})



export default router