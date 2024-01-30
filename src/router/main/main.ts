import { Router, Request, Response } from 'express'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const router = Router()

router.get('/login', (req, res) => {
    if(req.session.data){
        if(req.session.data.login){
            res.sendStatus(200)
        }
        else{
            res.sendStatus(403)
        }
    }
})
router.post('/login', async (req, res) => {
    prisma.user.findFirst({ where: { email: req.body.email, password: req.body.password } })
    .then((user) => {
        if(req.session.data === undefined){
            Error("Session not found")
        }
        else if(user === null){
            res.sendStatus(403)
        }
        else{
            req.session.data.login = true
            req.session.data.name = user.name
            req.session.data.id = user.userId
            req.session.save()
            res.sendStatus(200)
        }
    })
    .catch((err) => {
        console.log(err)
        res.sendStatus(403)
    })

})

type RegisterBody = {email: string, username: string, password: string}

router.post('/signup', async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    try{
    let user = await prisma.user.findFirst({
        where: {
            email: req.body.email
        }
    })
    if(user !== null){
        res.sendStatus(409)
        return
    }
    await prisma.user.create({
        data: {
            userId: uuidv4(),
            email: req.body.email,
            name: req.body.username,
            password: req.body.password
        }
    })
    res.sendStatus(200)
    }
    catch(err){
        console.log(err)
        res.sendStatus(500)
    }
})

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err){
            console.log(err)
        }
        else{
            res.redirect('/')
        }
    })
})

export default router