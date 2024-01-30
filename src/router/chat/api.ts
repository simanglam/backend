import { NextFunction, Router, Request, Response, request } from "express"
import { PrismaClient } from '@prisma/client'
import io from '../../app'
import session from "express-session"
import { name } from "ejs"

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
    if(req.session.data.login == false){
        res.sendStatus(403)
        return
    }
    let data = await prisma.user.findMany({
        where: {
            userId: req.session.data.id
        },
        select: {
            chatRooms: {
                select: {
                    id: true,
                    description: true,
                    name: true
                }
            }
        }
    })
    res.json(data[0].chatRooms)
})

router.get('/chatroom/:id/messages', async(req, res) => {
    if(req.session.data === undefined){ return}
    if(req.session.data.login == false){
        res.sendStatus(403)
        return
    }
    let data = await prisma.chatRoom.findMany({
        where: {
            id: req.params.id
        },
        select: {
            messages: {
                take: 10,
                select: {
                    user:{
                        select: {
                            name: true
                        }
                    },
                    createdAt: true,
                    text: true,
                    id: true
                },
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    })
    if(data === null){
        res.sendStatus(404)
        return
    }
    req.session.data.room = req.params.id
    req.session.save()
    let json_data = data[0].messages.map((message) => {return {text: message.text, author: message.user?.name, created: message.createdAt, id: message.id}})
    res.json(json_data)
})

router.post('/chatroom/:id/messages', async(req: Request<{id: string}, {text: string, createdAt: string}>, res) => {
    if(req.session.data === undefined){ return }
    if(req.session.data.login == false){
        res.sendStatus(403)
        return
    }
    await prisma.message.create({
        data: {
            text: req.body.text,
            createdAt: req.body.createdAt,
            user: {
                connect: {
                    userId: req.session.data.id,
                    name: req.session.data.name
                }
            },
            chatRoom: {
                connect: {
                    id: req.params.id
                }
            }
        }
    })
    io.sockets.in(req.params.id).emit("chat message", JSON.stringify({text: req.body.text, author: req.session.data.name, created: req.body.created, id: req.session.data.id}))
    res.sendStatus(200)
})

router.post('/danger', (req, res) => {
    prisma.message.deleteMany(
        { where: { user: {userId: "clrurv15p0000szzs2nq3r6lg"}} })
    res.sendStatus(200)
})

export default router