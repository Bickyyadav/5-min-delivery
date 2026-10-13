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
    const [expanded, setExpanded] = useState(false)
    const router = useRouter()

    useEffect((): any => {
        const socket = getSocket()
        socket.on("order-status-update", (data) => {
            if (data.orderId.toString() == order?._id!.toString()) {
                setStatus(data.status)
            }
        })
        return () => socket.off("order-status-update")
    }, [])


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
                    <span className={`px-3 py-1 text-xs font-semibold border rounded-full ${getStatusColor(
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

                {order.assignedDeliveryBoy && <><div className='mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between'>
                    <div className='flex items-center gap-3 text-sm text-gray-700'>
                        <UserCheck className="text-blue-600" size={18} />
                        <div className='font-semibold text-gray-800'>
                            <p className=''>Assigned to : <span>{order.assignedDeliveryBoy.name}</span></p>
                            <p className='text-xs text-gray-600'>📞 +91 {order.assignedDeliveryBoy.mobile}</p>
                        </div>
                    </div>

                    <a href={`tel:${order.assignedDeliveryBoy.mobile}`} className='bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition'>Call</a>
                </div>
                    <button className='w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-xl shadow hover:bg-green-700 transition' onClick={() => router.push(`/user/track-order/${order._id?.toString()}`)}><Truck size={18} /> Track Your Order</button>
                </>
                }

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