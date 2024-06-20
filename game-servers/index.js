import express from 'express'
import { WebSocketServer } from 'ws'
import 'dotenv/config'

const app = express()
const port = process.env.PORT
const httpServer = app.listen(port, () => {
  console.log('🎮 game servers is working on port ' + port)
})

const wss = new WebSocketServer({ server: httpServer })
let activeConnections = 0

wss.on('connection', function connection(ws) {
  
  ws.on('error', console.error)
  
  ws.on('message', function message(data, isBinary) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary })
      }
    })
  }) 
  console.log('🔌active connections: ' + ++activeConnections)

  ws.on('close', function close(){
    console.log('🔌active connections: ' + --activeConnections)
  }) 
  
  ws.send('✅ ws servers are healthy')
})

