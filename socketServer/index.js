import express from "express"
import dotenv from "dotenv"
import { Server } from "socket.io"
import axios from "axios"
import http from "http"

dotenv.config()
const app = express()
app.use(express.json())
const server = http.createServer(app)
const port = process.env.PORT || 5000

const allowedOrigins = [
    process.env.NEXT_BASE_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true)
            }
            return callback(null, true)
        },
        methods: ["GET", "POST"],
        credentials: true
    }
})

io.on("connection", (socket) => {
    console.log("🚀 ~ user connected", socket.id)
    socket.on("identity", async (userId) => {
        try {
            await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/connect`, { userId, socketId: socket.id })
        } catch (error) {
            console.error("Error connecting socket identity:", error?.message)
        }
    })
    socket.on("update-location", async ({ userId, latitude, longitude }) => {
        try {
            const location = {
                type: "Point",
                coordinates: [longitude, latitude]
            }
            await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/update-location`, { userId, location })
        } catch (error) {
            console.error("Error updating location:", error?.message)
        }
    })

    socket.on("join-room", (roomId) => {
        if (!roomId) return
        const roomStr = String(roomId)
        console.log(`Socket ${socket.id} joining room:`, roomStr)
        socket.join(roomStr)
    })

    socket.on("send-message", async (message) => {
        console.log("Socket server received message:", message)
        const roomId = String(message.roomId)
        let messagePayload = message
        try {
            const response = await axios.post(`${process.env.NEXT_BASE_URL}/api/chat/save`, message)
            if (response.data) {
                messagePayload = response.data
            }
        } catch (error) {
            console.error("Error saving message via axios:", error?.response?.data || error?.message)
        }

        io.to(roomId).emit("send-message", messagePayload)
    })


    // io.emit("update-deliveryBoy-location", { userId, location })

    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id)
    })
})

app.post("/notify", (req, res) => {
    const { event, data, socketId } = req.body
    if (socketId) {
        io.to(socketId).emit(event, data)
    } else {
        io.emit(event, data)
    }
    return res.status(200).json({ "success": true })
})


server.listen(port, () => {
    console.log("server started at", port)
})