import { Router, Request, Response } from 'express'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const router = Router()

router.get('/', (req, res) => {
    res.send('Main Page')
})

router.post('/login', (req, res) => {
    if(req.body.username === "admin" && req.body.password === "admin"){
        if(req.session.data === undefined){
            Error("Session not found")
        }
        else{
            req.session.data.login = true
            req.session.data.name = "admin"
            req.session.data.id = "admin"
            res.redirect('/chat')
        }
    }
})

type RegisterBody = {email: string, username: string, password: string}

router.post('/register', (req: Request<{}, {}, RegisterBody>, res: Response) => {
    prisma.user.create({
        data: {
            userId: uuidv4(),
            email: req.body.email,
            name: req.body.username,
            password: req.body.password
        }
    }).then(() => {
        res.sendStatus(200)
    }).catch((err) => {
        console.log(err)
    })
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

router.get('/info', (req, res) => {
    res.render("info.ejs", {info: "Hello World"})
})

export default router