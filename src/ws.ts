import { Server } from 'socket.io'
import { request, type RequestHandler, type Request } from 'express'
import * as http from 'http'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export default (server: http.Server): Server => {
    const io = new Server(server, {
        allowEIO3: true,
    })

    io.on('connection', (socket) => {
        
        console.log(`New ws connection ${socket.id}`)

        socket.on('disconnect', () => {
            socket.disconnect()
            return
        })

        socket.on('chat message', (msg) => {
            console.log(msg)
            const nowRoom = Array.from(socket.rooms).find(room =>{
                return room !== socket.id
            })
            console.log(socket.rooms)
            if(nowRoom === undefined){
                return
            }
            io.to(nowRoom).emit('chat message', msg)
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
            console.log(`${socket.id} join the room ${room}`)
            socket.join(room)
            socket.emit('room added', room)
        })
    })
    return io
}