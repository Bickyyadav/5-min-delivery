"use client"
import dynamic from 'next/dynamic'
const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false })
import { IUser } from '@/models/user.model'
import { RootState } from '@/redux/store'
import { ArrowLeft, CheckCircle, Home, Loader, PartyPopper, Phone, Send, Sparkle, Truck, UserCheck } from 'lucide-react'
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
    const [countdown, setCountdown] = useState(3)
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
                if (result.data?.address?.latitude && result.data?.address?.longitude) {
                    setUserLocation({
                        latitude: Number(result.data.address.latitude),
                        longitude: Number(result.data.address.longitude)
                    })
                }
                if (result.data?.assignedDeliveryBoy?.location?.coordinates) {
                    setDeliveryBoyLocation({
                        latitude: result.data.assignedDeliveryBoy.location.coordinates[1],
                        longitude: result.data.assignedDeliveryBoy.location.coordinates[0]
                    })
                }
            } catch (error) {
                console.log(error)
            }
        }
        getOrder()
    }, [orderId, userData?._id])

    // Auto-navigate to home 3 seconds after delivery
    useEffect(() => {
        if (order?.status !== "delivered") return
        setCountdown(3)
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    router.push("/")
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [order?.status, router])

    useEffect((): any => {
        if (!orderId) return
        const socket = getSocket()

        const handleStatusUpdate = (data: { orderId: string, status: "pending" | "out of delivery" | "delivered", assignedDeliveryBoy?: IUser }) => {
            if (data?.orderId && data.orderId.toString() === orderId.toString()) {
                setOrder((prev) => prev ? {
                    ...prev,
                    status: data.status,
                    ...(data.assignedDeliveryBoy ? { assignedDeliveryBoy: data.assignedDeliveryBoy } : {})
                } : prev)

                if (data.assignedDeliveryBoy?.location?.coordinates) {
                    setDeliveryBoyLocation({
                        latitude: data.assignedDeliveryBoy.location.coordinates[1],
                        longitude: data.assignedDeliveryBoy.location.coordinates[0]
                    })
                }
            }
        }

        const handleOrderAssigned = (data: { orderId: string, assignedDeliveryBoy: IUser }) => {
            if (data?.orderId && data.orderId.toString() === orderId.toString()) {
                setOrder((prev) => prev ? { ...prev, assignedDeliveryBoy: data.assignedDeliveryBoy } : prev)
                if (data.assignedDeliveryBoy?.location?.coordinates) {
                    setDeliveryBoyLocation({
                        latitude: data.assignedDeliveryBoy.location.coordinates[1],
                        longitude: data.assignedDeliveryBoy.location.coordinates[0]
                    })
                }
            }
        }

        const handleLocationUpdate = (data: any) => {
            setDeliveryBoyLocation({
                latitude: data.location?.coordinates?.[1] ?? data.location?.latitude ?? 0,
                longitude: data.location?.coordinates?.[0] ?? data.location?.longitude ?? 0,
            })
        }

        socket.on("order-status-update", handleStatusUpdate)
        socket.on("order-assigned", handleOrderAssigned)
        socket.on("update-deliveryBoy-location", handleLocationUpdate)

        return () => {
            socket.off("order-status-update", handleStatusUpdate)
            socket.off("order-assigned", handleOrderAssigned)
            socket.off("update-deliveryBoy-location", handleLocationUpdate)
        }
    }, [orderId])

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
                <div className='px-4 mt-4 space-y-4'>
                    {order?.status === "out of delivery" && (
                        order.assignedDeliveryBoy ? (
                            <div className='bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between shadow-xs'>
                                <div className='flex items-center gap-3 text-sm text-gray-700'>
                                    <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0'>
                                        <UserCheck size={20} />
                                    </div>
                                    <div className='font-semibold text-gray-800 leading-tight'>
                                        <p className='text-xs text-blue-600 font-bold uppercase tracking-wider'>Out for Delivery</p>
                                        <p className='text-sm text-gray-900 mt-0.5'>{order.assignedDeliveryBoy.name}</p>
                                        <p className='text-xs text-gray-500 font-normal mt-0.5'>📞 +91 {order.assignedDeliveryBoy.mobile}</p>
                                    </div>
                                </div>
                                <a
                                    href={`tel:${order.assignedDeliveryBoy.mobile}`}
                                    className='flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-xs'
                                >
                                    <Phone size={14} /> Call
                                </a>
                            </div>
                        ) : (
                            <div className='bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs'>
                                <div className='relative w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0'>
                                    <Truck size={20} className='animate-bounce' />
                                    <span className='absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping' />
                                </div>
                                <div className='text-xs'>
                                    <p className='font-bold text-amber-900 text-sm'>Out for Delivery!</p>
                                    <p className='text-amber-700 mt-0.5'>Finding and assigning the nearest delivery partner for your order...</p>
                                </div>
                            </div>
                        )
                    )}

                    {order?.status === "delivered" ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className='relative overflow-hidden rounded-3xl border border-green-200 shadow-lg'
                        >
                            {/* Animated gradient background */}
                            <div className='absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 opacity-10' />
                            <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.2),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(20,184,166,0.15),transparent_50%)]' />

                            {/* Floating confetti particles */}
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className='absolute w-2 h-2 rounded-full'
                                    style={{
                                        background: ['#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#a855f7', '#14b8a6', '#f97316', '#06b6d4'][i],
                                        left: `${10 + i * 12}%`,
                                        top: '-8px'
                                    }}
                                    animate={{
                                        y: [0, 200, 250],
                                        x: [0, (i % 2 === 0 ? 20 : -20), (i % 2 === 0 ? -10 : 10)],
                                        opacity: [1, 0.8, 0],
                                        rotate: [0, 360, 720]
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        delay: i * 0.15,
                                        repeat: Infinity,
                                        repeatDelay: 1
                                    }}
                                />
                            ))}

                            <div className='relative p-6 flex flex-col items-center text-center gap-4'>
                                {/* Animated checkmark with ring */}
                                <motion.div
                                    className='relative'
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                                >
                                    <div className='w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30'>
                                        <CheckCircle size={40} className='text-white' strokeWidth={2.5} />
                                    </div>
                                    <motion.div
                                        className='absolute inset-0 rounded-full border-2 border-green-400'
                                        animate={{ scale: [1, 1.4, 1.4], opacity: [0.6, 0, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                                    />
                                    <motion.div
                                        className='absolute inset-0 rounded-full border-2 border-emerald-300'
                                        animate={{ scale: [1, 1.6, 1.6], opacity: [0.4, 0, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                                    />
                                </motion.div>

                                {/* Party poppers */}
                                <motion.div
                                    className='flex items-center gap-2'
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <motion.div animate={{ rotate: [-10, 10, -10] }} transition={{ duration: 0.5, repeat: Infinity }}>
                                        <PartyPopper size={22} className='text-amber-500' />
                                    </motion.div>
                                    <h3 className='text-xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent'>
                                        Order Delivered!
                                    </h3>
                                    <motion.div animate={{ rotate: [10, -10, 10] }} transition={{ duration: 0.5, repeat: Infinity }}>
                                        <PartyPopper size={22} className='text-amber-500 scale-x-[-1]' />
                                    </motion.div>
                                </motion.div>

                                <motion.p
                                    className='text-sm text-gray-600 max-w-xs'
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    Your order has been delivered successfully. Thank you for shopping with us! 🎉
                                </motion.p>

                                {/* Countdown with circular timer */}
                                <motion.div
                                    className='flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-2xl px-5 py-3 border border-green-100 shadow-sm'
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <div className='relative w-10 h-10'>
                                        <svg className='w-10 h-10 -rotate-90' viewBox="0 0 40 40">
                                            <circle cx="20" cy="20" r="16" fill="none" stroke="#dcfce7" strokeWidth="3" />
                                            <motion.circle
                                                cx="20" cy="20" r="16" fill="none" stroke="#22c55e" strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeDasharray={100.53}
                                                initial={{ strokeDashoffset: 0 }}
                                                animate={{ strokeDashoffset: 100.53 }}
                                                transition={{ duration: 3, ease: "linear" }}
                                            />
                                        </svg>
                                        <span className='absolute inset-0 flex items-center justify-center text-sm font-bold text-green-700'>
                                            {countdown}
                                        </span>
                                    </div>
                                    <div className='text-left'>
                                        <p className='text-xs text-gray-500 font-medium'>Redirecting to home in</p>
                                        <p className='text-sm font-bold text-green-700'>{countdown} second{countdown !== 1 ? 's' : ''}</p>
                                    </div>
                                    <Home size={18} className='text-green-600 ml-1' />
                                </motion.div>

                                {/* Progress bar */}
                                <div className='w-full h-1.5 bg-green-100 rounded-full overflow-hidden mt-1'>
                                    <motion.div
                                        className='h-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full'
                                        initial={{ width: "100%" }}
                                        animate={{ width: "0%" }}
                                        transition={{ duration: 3, ease: "linear" }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default page
