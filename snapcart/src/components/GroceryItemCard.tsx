"use client"
import React from 'react'
import { motion } from "motion/react"
import Image from 'next/image'
import { AlertCircle, CheckCircle2, Minus, Plus, ShoppingCart } from 'lucide-react'
import { addToCart, increaseQuantity, decreaseQuantity } from '@/redux/cartSlice'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'

export interface IGroceryCardItem {
    _id: string;
    name: string;
    category: string;
    price: string;
    unit: string;
    image: string;
    createdAt?: Date;
    updatedAt?: Date;
    isAvailable?: boolean;
    stock?: number;
    inventoryId?: string;
    inventoryName?: string;
}

const GroceryItemCard = ({ item }: { item: IGroceryCardItem }) => {
    const dispatch = useDispatch<AppDispatch>()
    const { cartData } = useSelector((state: RootState) => state.cart)
    const cartItem = cartData.find(i => i._id.toString() == item._id)

    // Check if item is available in current inventory (default to true if inventory not set yet)
    const isAvailable = item.isAvailable !== undefined ? item.isAvailable : true
    const stockCount = item.stock !== undefined ? item.stock : null

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true, amount: 0.2 }}
            className={`bg-white rounded-[22px] shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden border flex flex-col relative group ${
                isAvailable ? 'border-gray-100 hover:border-green-200' : 'border-gray-200 opacity-80'
            }`}
        >
            {/* Availability status badge over image */}
            <div className='absolute top-3 right-3 z-10'>
                {isAvailable ? (
                    <span className='inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50/90 backdrop-blur-xs border border-emerald-200 px-2.5 py-1 rounded-full shadow-xs'>
                        <CheckCircle2 size={12} className='text-emerald-600' />
                        Available {stockCount !== null && stockCount > 0 ? `(${stockCount})` : ''}
                    </span>
                ) : (
                    <span className='inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50/90 backdrop-blur-xs border border-red-200 px-2.5 py-1 rounded-full shadow-xs'>
                        <AlertCircle size={12} className='text-red-500' />
                        Out of Stock
                    </span>
                )}
            </div>

            <div className='relative w-full aspect-4/3 bg-gray-50/80 overflow-hidden'>
                <Image 
                    src={item.image} 
                    fill 
                    alt={item.name} 
                    sizes='(max-width: 768px) 100vw, 25vw' 
                    className={`object-contain p-4 transition-transform duration-500 ${
                        isAvailable ? 'group-hover:scale-105' : 'grayscale-50'
                    }`} 
                />
                <div className='absolute inset-0 bg-linear-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300' />
            </div>

            <div className='p-4 flex flex-col flex-1'>
                <div className='flex items-center justify-between mb-1'>
                    <p className='text-xs text-gray-500 font-medium'>{item.category}</p>
                </div>
                
                <h3 className='font-bold text-gray-800 text-sm md:text-base line-clamp-1 group-hover:text-green-700 transition-colors'>
                    {item.name}
                </h3>

                <div className='flex items-center justify-between mt-2.5'>
                    <span className='text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md'>{item.unit}</span>
                    <span className='text-green-700 font-extrabold text-lg'>₹{item.price}</span>
                </div>

                {/* Action button based on availability */}
                {!isAvailable ? (
                    <div className='mt-4 flex items-center justify-center gap-2 bg-gray-100 text-gray-400 rounded-full py-2.5 text-xs sm:text-sm font-semibold cursor-not-allowed select-none border border-gray-200'>
                        <AlertCircle size={15} />
                        Unavailable for Delivery
                    </div>
                ) : !cartItem ? (
                    <motion.button 
                        className='mt-4 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-full py-2.5 text-sm font-semibold transition-all shadow-sm hover:shadow-md'
                        whileTap={{ scale: 0.95 }}
                        onClick={() => dispatch(addToCart({ ...item, quantity: 1 } as any))}
                    >
                        <ShoppingCart size={16} /> 
                        Add to Cart
                    </motion.button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className='mt-4 flex items-center justify-between bg-green-50 border border-green-200 rounded-full py-1.5 px-3'
                    >
                        <button 
                            className='w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-xs hover:bg-green-100 transition-all border border-green-200 active:scale-90' 
                            onClick={() => dispatch(decreaseQuantity(item._id))}
                        >
                            <Minus size={15} className='text-green-700' />
                        </button>
                        <span className='text-sm font-bold text-green-900'>{cartItem.quantity} in cart</span>
                        <button 
                            className='w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-xs hover:bg-green-100 transition-all border border-green-200 active:scale-90'
                            onClick={() => dispatch(increaseQuantity(item._id))}
                        >
                            <Plus size={15} className='text-green-700' />
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}

export default GroceryItemCard