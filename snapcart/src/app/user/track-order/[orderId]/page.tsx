"use client"
import dynamic from 'next/dynamic'
const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false })
import { IUser } from '@/models/user.model'
import { RootState } from '@/redux/store'
import { ArrowLeft, Loader, Send, Sparkle } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { AnimatePresence, motion } from "motion/react"
import axios from 'axios'
import { getSocket } from '@/lib/socket'
import { IMessage } from '@/models/message.model'


interface IOrder {
    _id?: string
    user: string
    items: [
        {
            grocery: string,
            name: string,
            price: string,
            unit: string,
            image: string
            quantity: number
        }
    ]
    ,
    isPaid: boolean
    totalAmount: number,
    paymentMethod: "cod" | "online"
    address: {
        fullName: string,
        mobile: string,
        city: string,
        state: string,
        pincode: string,
        fullAddress: string,
        latitude: number,
        longitude: number
    }
    assignment?: string
    assignedDeliveryBoy?: IUser
    status: "pending" | "out of delivery" | "delivered",
    createdAt?: Date
    updatedAt?: Date
}
interface ILocation {
    latitude: number,
    longitude: number
}

const page = ({ params }: { params: { orderId: string } }) => {
    const { userData } = useSelector((state: RootState) => state.user)
    const chatBoxRef = useRef<HTMLDivElement>(null)
    const { orderId } = useParams()
    const router = useRouter()
    const [order, setOrder] = useState<IOrder>()
    const [newMessage, setNewMessage] = useState("")
    const [messages, setMessages] = useState<IMessage[]>([])
    const [loading, setLoading] = useState(false)
    const [suggestions, setSuggestions] = useState([])
    const [userLocation, setUserLocation] = useState<ILocation>(
        {
            latitude: 0,
            longitude: 0
        }
    )
    const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>({
        latitude: 0,
        longitude: 0
    })


    useEffect(() => {
        const getOrder = async () => {
            try {
                const result = await axios.get(`/api/user/get-order/${orderId}`)
                setOrder(result.data)
                setUserLocation({
                    latitude: result.data.address.latitude,
                    longitude: result.data.address.longitude
                })
                setDeliveryBoyLocation({
                    latitude: result.data.assignedDeliveryBoy.location.coordinates[1],
                    longitude: result.data.assignedDeliveryBoy.location.coordinates[0]
                })

            } catch (error) {
                console.log(error)
            }
        }
        getOrder()
    }, [userData?._id])


    useEffect((): any => {
        const socket = getSocket()
        socket.on("update-deliveryBoy-location", (data) => {
            console.log(location)
            setDeliveryBoyLocation({
                latitude: data.location.coordinates?.[1] ?? data.location.latitude,
                longitude: data.location.coordinates?.[0] ?? data.location.longitude,

            })
        })
        return () => socket.off("update-deliveryBoy-location")
    }, [order])

    useEffect(() => {
        chatBoxRef.current?.scrollTo({
            top: chatBoxRef.current.scrollHeight,
            behavior: "smooth"
        })
    }, [messages])

    useEffect(() => {
        if (!orderId) return
        const getAllMessages = async () => {
            try {
                const result = await axios.post("/api/chat/messages", { roomId: orderId })
                setMessages(result.data || [])
            } catch (error) {
                console.log(error)
            }
        }
        getAllMessages()
    }, [orderId])

    useEffect(() => {
        if (!orderId) return
        const socket = getSocket()

        const joinRoom = () => {
            socket.emit("join-room", orderId.toString())
        }

        joinRoom()
        socket.on("connect", joinRoom)

        const handleNewMessage = (incomingMsg: IMessage) => {
            if (incomingMsg.roomId?.toString() === orderId.toString()) {
                setMessages((prev) => {
                    const prevList = prev || []
                    const exists = prevList.some(
                        (m) =>
                            (m._id && incomingMsg._id && m._id.toString() === incomingMsg._id.toString()) ||
                            (m.text === incomingMsg.text &&
                                m.time === incomingMsg.time &&
                                m.senderId?.toString() === incomingMsg.senderId?.toString())
                    )
                    if (exists) return prevList
                    return [...prevList, incomingMsg]
                })
            }
        }

        socket.on("send-message", handleNewMessage)

        return () => {
            socket.off("connect", joinRoom)
            socket.off("send-message", handleNewMessage)
        }
    }, [orderId])


    const sendMsg = () => {
        if (!newMessage.trim() || !orderId) return
        const socket = getSocket()

        const message = {
            roomId: orderId,
            text: newMessage.trim(),
            senderId: userData?._id,
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })
        }
        socket.emit("send-message", message)

        setNewMessage("")
    }


    const getSuggestion = async () => {

    }



    return (
        <div className='w-full min-h-screen bg-linear-to-b from-green-50 to-white'>
            <div className='max-w-2xl mx-auto pb-24'>
                <div className='sticky top-0 bg-white/80 backdrop-blur-xl p-4 border-b shadow flex gap-3 items-center z-999'>
                    <button className='p-2 bg-green-100 rounded-full' onClick={() => router.back()}><ArrowLeft className="text-green-700" size={20} /></button>
                    <div>
                        <h2 className='text-xl font-bold'>Track Order</h2>
                        <p className='text-sm text-gray-600'>order#{order?._id?.toString().slice(-6)} <span className='text-green-700 font-semibold'>{order?.status}</span></p>
                    </div>

                </div>
                <div className='px-4 mt-6 space-y-4'>
                    <div className='rounded-3xl overflow-hidden border shadow'>
                        <LiveMap userLocation={userLocation} deliveryBoyLocation={deliveryBoyLocation} />
                    </div>
                    <div className='bg-white rounded-3xl shadow-lg border p-4 h-[430px] flex flex-col'>

                        <div className='flex justify-between items-center mb-3'>
                            <span className='font-semibold text-gray-700 text-sm'>Quick Replies</span>
                            <motion.button
                                disabled={loading}
                                whileTap={{ scale: 0.9 }}
                                className="px-3 py-1 text-xs flex items-center gap-1 bg-purple-100 text-purple-700 rounded-full shadow-sm border border-purple-200 cursor-pointer"
                                onClick={getSuggestion}
                            ><Sparkle size={14} />{loading ? <Loader className="w-5 h-5 animate-spin" /> : "AI suggest"}</motion.button>
                        </div>
                        <div className='flex gap-2 flex-wrap mb-3'>
                            {suggestions.map((s, i) => (
                                <motion.div
                                    key={s}
                                    whileTap={{ scale: 0.92 }}
                                    className="px-3 py-1 text-xs bg-green-50 border border-green-200 cursor-pointer text-green-700 rounded-full"
                                    onClick={() => setNewMessage(s)}
                                >
                                    {s}
                                </motion.div>
                            ))}
                        </div>
                        <div className='flex-1 overflow-y-auto p-2 space-y-3' ref={chatBoxRef}>
                            <AnimatePresence>
                                {messages?.map((msg, index) => (
                                    <motion.div
                                        key={msg._id?.toString() || `${msg.senderId?.toString()}-${msg.time}-${index}`}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex ${msg.senderId?.toString() === userData?._id?.toString() ? "justify-end" : "justify-start"}`}
                                    >
                                        <div className={`px-4 py-2 max-w-[75%] rounded-2xl shadow 
                  ${msg.senderId?.toString() === userData?._id?.toString()
                                                ? "bg-green-600 text-white rounded-br-none"
                                                : "bg-gray-100 text-gray-800 rounded-bl-none"
                                            }`}>
                                            <p >{msg.text}</p>
                                            <p className='text-[10px] opacity-70 mt-1 text-right'>{msg.time}</p>
                                        </div>

                                    </motion.div>
                                ))}
                            </AnimatePresence>

                        </div>
                        <div className='flex gap-2 mt-3 border-t pt-3'>
                            <input
                                type="text"
                                placeholder='Type a Message...'
                                className='flex-1 bg-gray-100 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-green-500'
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        sendMsg()
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className='bg-green-600 hover:bg-green-700 p-3 rounded-xl text-white cursor-pointer'
                                onClick={sendMsg}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        // </div >
    )
}

export default page
