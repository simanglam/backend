import { Server } from 'socket.io'
import * as http from 'http'

export default (server: http.Server): Server => {
    const io = new Server(server, {
        allowEIO3: true,
        cors: {
            origin: 'http://localhost:3000', 
            credentials: true, 
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
            allowedHeaders: 'X-Requested-With,content-type'
        }
    })

    io.on('connection', (socket) => {
        console.log('a user connected')

        socket.on('disconnect', () => {
            socket.disconnect()
            console.log('user disconnected')
            return
        })

        socket.on('chat message', (msg) => {
            let nowRoom = Array.from(socket.rooms).find(room => {
                return room !== socket.id
            })
            console.log(nowRoom)
            if (nowRoom === undefined){
                socket.broadcast.emit('chat message', msg)
            }
            else{
                console.log(`user ${socket.id} send message: ${msg} in room: ${nowRoom}`)
                socket.to(nowRoom).emit('chat message', msg)
            }
        })

        socket.on('typing', () => { 
            socket.broadcast.emit('typing')
        })

        socket.on('stop typing', () => {      
            socket.broadcast.emit('stop typing')
        })

        socket.on('user joined', (msg) => {     
            socket.broadcast.emit('user joined', msg)
        })

        socket.on('user left', (msg) => {      
            socket.broadcast.emit('user left', msg)
        })

        socket.on('new message', (msg) => {     
            socket.broadcast.emit('new message', msg)
        })

        socket.on('add room', (room) => {
            const nowRoom = Object.keys(socket.rooms).find(room =>{
                return room !== socket.id
            })

            if(nowRoom){
                socket.leave(nowRoom)
            }

            socket.join(room)
            console.log(`user ${socket.id} room added: ${room}`)
            socket.emit('room added', room) 
        })
    })
    return io
}