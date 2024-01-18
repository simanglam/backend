import cors from 'cors'
import ejs from 'ejs'
import { Server } from 'socket.io'
import { createServer } from 'http'
import session, { Store } from 'express-session'
import express, { Request, Response, ErrorRequestHandler, NextFunction } from 'express'

import initWebsocket from './ws'

import chat from './router/chat/chat'
import main from './router/main/main'

import data from './interface/session'

declare module 'express-session' {
    interface SessionData {
      data: data;
    }
  }

var bodyParser = require('body-parser');
const app = express()
const port: number = 4000
const server = createServer(app)
const io = initWebsocket(server)

app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.url} at ${new Date().toLocaleString()} from ${req.ip}`)
    next()
})
app.use(cors({ origin: 'http://localhost:3000', credentials: true, methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', allowedHeaders: 'X-Requested-With,content-type'}))
app.use(bodyParser.json())
app.use(session({
    secret: "我好像可以用中文當密鑰",
    resave: false,
    cookie: {
        maxAge: 60000
    }
}))
app.set('view engine', 'ejs')
app.set('views', './src/views')

app.use(express.static('static'))
app.use("/", main)
app.use('/chat', chat)

let e: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
}

app.use(e)

app.listen(port, () => {console.log(`Example app listening at http://localhost:${port}`)})