import cors from 'cors'
import ejs from 'ejs'
import { Server } from 'socket.io'
import { createServer } from 'http'
import session, { MemoryStore, Store } from 'express-session'
import express, { Request, Response, ErrorRequestHandler, NextFunction } from 'express'

import initWebsocket from './ws'

import api from './router/chat/api'
import main from './router/main/main'
import data from './interface/session'

declare module 'express-session' {
    interface SessionData {
      data: data;
    }
}

var bodyParser = require('body-parser');
import { CorsOptions } from 'cors';
const app = express()
const port: number = 4000
const server = createServer(app)
const corsOptions: CorsOptions = {
    origin: true,
    credentials: true,
};
app.enable('trust proxy')
app.set('trust proxy', 1)
const sessionStore: Store = new MemoryStore({})
const sessionMiddleware = session({
    name: "Who Knows",
    secret: "我好像可以用中文當密鑰",
    resave: false,
    cookie: {
        maxAge: 600000,
        secure: true,
        sameSite: 'none'
    },
    saveUninitialized: true,
    store: sessionStore
})

const io = initWebsocket(server)
export default io


app.use(bodyParser.json());
app.use(sessionMiddleware)
app.use((req: Request, res: Response, next) => {
    if(req.session.data === undefined){
        console.log("Session not found")
        console.log(req.session.id)
        req.session.data = {
            login: false,
            name: "",
            id: "",
            room: ""
        }
    }
    req.session.save()
    next()
})
app.use(cors(corsOptions));
app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.url} at ${new Date().toLocaleString()} from ${req.ip} ${req.ips}`)
    next()
})
app.set('view engine', 'ejs')
app.set('views', './src/views')
app.use("/static", express.static('./src/static'))
app.use("/api", main)
app.use("/api", api)

let e: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
}

app.use(e)

server.listen(port, () => {console.log(`Server listening on port ${port}`)})