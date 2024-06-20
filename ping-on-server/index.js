import express, { urlencoded } from 'express'
import 'dotenv/config'
import cors from 'cors'

const app = express()
const port = process.env.PORT

// middlewares
app.use(urlencoded({extended: true}))
app.use(express.json())
app.use(cors())

// app initialization
app.get('/', (req, res) => {
    res.json({message: '✅ ping-on servers are healthy'})
})

app.listen(port, () => {
    console.log('✅ main server is working on port : ' + port)
})