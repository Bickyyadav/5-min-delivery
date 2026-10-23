import React, { useEffect, useState } from 'react'
import { motion } from "motion/react"
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, CreditCard, MapPin, Package, Truck, UserCheck } from 'lucide-react'
import Image from 'next/image'
import { getSocket } from '@/lib/socket'
import { IUser } from '@/models/user.model'


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

const UserOrderCard = ({ order }: { order: IOrder }) => {
    const [status, setStatus] = useState(order.status)
    const [assignedDeliveryBoy, setAssignedDeliveryBoy] = useState<IUser | undefined>(order.assignedDeliveryBoy)
    const [expanded, setExpanded] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (order.status) {
            setStatus(order.status)
        }
    }, [order.status])

    useEffect(() => {
        if (order.assignedDeliveryBoy) {
            setAssignedDeliveryBoy(order.assignedDeliveryBoy)
        }
    }, [order.assignedDeliveryBoy])

    useEffect((): any => {
        const socket = getSocket()

        const handleStatusUpdate = (data: { orderId: string, status: "pending" | "out of delivery" | "delivered", assignedDeliveryBoy?: IUser }) => {
            if (data?.orderId && order?._id && data.orderId.toString() === order._id.toString()) {
                setStatus(data.status)
                if (data.assignedDeliveryBoy) {
                    setAssignedDeliveryBoy(data.assignedDeliveryBoy)
                }
            }
        }

        const handleOrderAssigned = (data: { orderId: string, assignedDeliveryBoy: IUser }) => {
            if (data?.orderId && order?._id && data.orderId.toString() === order._id.toString()) {
                setAssignedDeliveryBoy(data.assignedDeliveryBoy)
            }
        }

        socket.on("order-status-update", handleStatusUpdate)
        socket.on("order-assigned", handleOrderAssigned)

        return () => {
            socket.off("order-status-update", handleStatusUpdate)
            socket.off("order-assigned", handleOrderAssigned)
        }
    }, [order?._id])


    const getStatusColor = (status: string) => {
        switch (status) {

            case "pending":
                return "bg-yellow-100 text-yellow-700 border-yellow-300"
            case "out of delivery":
                return "bg-blue-100 text-blue-700 border-blue-300"
            case "delivered":
                return "bg-green-100 text-green-700 border-green-300"
            default:
                return "bg-gray-100 text-gray-600 border-gray-300"
        }
    }
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className='bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-gray-100 px-4 py-3 bg-linear-to-r from-green-50/50 to-white'>
                <div>
                    <h3 className='text-base font-bold text-gray-800 tracking-tight'>Order <span className='text-green-700'>#{order?._id?.toString()?.slice(-6)}</span></h3>
                    <p className='text-xs text-gray-500 mt-0.5'>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Unknown Date'}</p>
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                    {status !== "delivered" && <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${order.isPaid
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-red-100 text-red-700 border-red-300"
                        }`}
                    >
                        {order.isPaid ? "Paid" : "Unpaid"}
                    </span>}
                    <span className={`px-3 py-1 text-xs font-semibold border rounded-full capitalize ${getStatusColor(
                        status
                    )}`}
                    >
                        {status}
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-3">
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    {order.paymentMethod == "cod" ? (
                        <div className='flex items-start gap-2.5 text-sm bg-gray-50/80 p-2.5 rounded-xl border border-gray-100'>
                            <div className='bg-green-100 p-1.5 rounded-full text-green-700 shrink-0'><Truck size={14} /></div>
                            <div>
                                <p className='font-semibold text-gray-800 text-xs'>Payment Method</p>
                                <p className='text-gray-500 text-[11px] mt-0.5'>Cash On Delivery</p>
                            </div>
                        </div>
                    ) : (
                        <div className='flex items-start gap-2.5 text-sm bg-gray-50/80 p-2.5 rounded-xl border border-gray-100'>
                            <div className='bg-green-100 p-1.5 rounded-full text-green-700 shrink-0'><CreditCard size={14} /></div>
                            <div>
                                <p className='font-semibold text-gray-800 text-xs'>Payment Method</p>
                                <p className='text-gray-500 text-[11px] mt-0.5'>Online Payment</p>
                            </div>
                        </div>
                    )}

                    <div className='flex items-start gap-2.5 text-sm bg-gray-50/80 p-2.5 rounded-xl border border-gray-100'>
                        <div className='bg-green-100 p-1.5 rounded-full text-green-700 shrink-0'><MapPin size={14} /></div>
                        <div>
                            <p className='font-semibold text-gray-800 text-xs'>Delivery Address</p>
                            <p className='text-gray-500 text-[11px] mt-0.5 line-clamp-2 leading-snug'>{order.address.fullAddress}</p>
                        </div>
                    </div>
                </div>

                {status === "out of delivery" && (
                    <div className='mt-3 space-y-3'>
                        {assignedDeliveryBoy ? (
                            <div className='bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-xs'>
                                <div className='flex items-center gap-3 text-sm text-gray-700'>
                                    <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0'>
                                        <UserCheck size={20} />
                                    </div>
                                    <div className='font-semibold text-gray-800 leading-tight'>
                                        <p className='text-xs text-blue-600 font-bold uppercase tracking-wider'>Delivery Partner Assigned</p>
                                        <p className='text-sm text-gray-900 mt-0.5'>{assignedDeliveryBoy.name}</p>
                                        <p className='text-xs text-gray-500 font-normal mt-0.5'>📞 +91 {assignedDeliveryBoy.mobile}</p>
                                    </div>
                                </div>
                                <a
                                    href={`tel:${assignedDeliveryBoy.mobile}`}
                                    className='bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-xs active:scale-95'
                                >
                                    Call
                                </a>
                            </div>
                        ) : (
                            <div className='bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs'>
                                <div className='relative w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0'>
                                    <Truck size={20} className='animate-bounce' />
                                    <span className='absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping' />
                                </div>
                                <div className='text-xs'>
                                    <p className='font-bold text-amber-900'>Order is Out for Delivery!</p>
                                    <p className='text-amber-700 mt-0.5'>Finding and assigning the nearest delivery partner for your order...</p>
                                </div>
                            </div>
                        )}
                        <button
                            className='w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md transition active:scale-98'
                            onClick={() => router.push(`/user/track-order/${order._id?.toString()}`)}
                        >
                            <Truck size={18} />
                            Track Your Order Live
                        </button>
                    </div>
                )}

                {status === "delivered" && (
                    <div className='mt-3 bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-green-800 font-semibold'>
                        <Truck size={16} className='text-green-600' />
                        <span>Order has been successfully delivered!</span>
                    </div>
                )}

                <div className='border border-gray-100 rounded-xl overflow-hidden shadow-xs'>
                    <button
                        onClick={() => setExpanded(prev => !prev)}
                        className='w-full flex justify-between items-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition p-3'
                    >
                        <span className='flex items-center gap-2 text-xs'>
                            <Package size={16} className="text-green-600" />
                            {expanded ? "Hide Order Items" : `View ${order.items.length} Items`}
                        </span>
                        {expanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                    </button>

                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                            height: expanded ? "auto" : 0,
                            opacity: expanded ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden bg-gray-50/50"
                    >
                        <div className='p-3 space-y-2 border-t border-gray-100'>
                            {order.items.map((item, index) => (
                                <div
                                    key={index}
                                    className='flex justify-between items-center bg-white rounded-lg p-2 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-100'>
                                    <div className='flex items-center gap-2.5'>
                                        <Image src={item.image} alt={item.name} width={40} height={40} className="rounded-md object-cover border border-gray-100" />
                                        <div>
                                            <p className='text-xs font-semibold text-gray-800 line-clamp-1'>{item.name}</p>
                                            <p className='text-[10px] text-gray-500 mt-0.5 font-medium'>{item.quantity} x {item.unit}</p>
                                        </div>
                                    </div>
                                    <p className='text-xs font-bold text-gray-800'>₹{Number(item.price) * item.quantity}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className='bg-linear-to-r from-green-50 to-green-100/50 border-t border-green-100 px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm'>
                <div className='flex items-center gap-2 text-gray-700'>
                    <Truck size={16} className="text-green-600" />
                    <span className="font-medium text-xs">Delivery: <span className='text-green-700 font-bold ml-1 uppercase tracking-wider'>{status}</span></span>
                </div>
                <div className="font-medium text-gray-700 text-xs">
                    Total Amount: <span className='text-green-700 font-black text-base ml-1'>₹{order.totalAmount}</span>
                </div>
            </div>
        </motion.div>
    )
}

export default UserOrderCard