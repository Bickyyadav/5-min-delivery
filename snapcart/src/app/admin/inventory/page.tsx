"use client"
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
    ArrowLeft, 
    Boxes, 
    Check, 
    Crosshair, 
    Eye, 
    EyeOff, 
    Globe, 
    Layers, 
    Loader2, 
    MapPin, 
    Package, 
    Save, 
    Search, 
    Sparkles, 
    Store, 
    TrendingUp 
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface IGrocery {
    _id: string;
    name: string;
    category: string;
    price: string;
    unit: string;
    image: string;
}

interface IInventoryItem {
    grocery: string | IGrocery;
    quantity: number;
    isAvailable: boolean;
}

export default function AdminInventoryPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [savingDetails, setSavingDetails] = useState(false)
    const [savingStock, setSavingStock] = useState(false)
    const [statusMessage, setStatusMessage] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")

    // Inventory Store details
    const [storeName, setStoreName] = useState("")
    const [fullAddress, setFullAddress] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [pincode, setPincode] = useState("")
    const [latitude, setLatitude] = useState<number>(0)
    const [longitude, setLongitude] = useState<number>(0)
    const [deliveryRadiusKm, setDeliveryRadiusKm] = useState<number>(15)
    const [isActive, setIsActive] = useState<boolean>(true)

    // Groceries catalog & stock state
    const [groceries, setGroceries] = useState<IGrocery[]>([])
    const [stockMap, setStockMap] = useState<{ [groceryId: string]: { quantity: number; isAvailable: boolean } }>({})

    useEffect(() => {
        fetchInventoryData()
    }, [])

    const fetchInventoryData = async () => {
        try {
            setLoading(true)
            const res = await axios.get("/api/admin/inventory")
            const data = res.data
            setGroceries(data.allGroceries || [])

            if (data.inventory) {
                const inv = data.inventory
                setStoreName(inv.name || "")
                setFullAddress(inv.address?.fullAddress || "")
                setCity(inv.address?.city || "")
                setState(inv.address?.state || "")
                setPincode(inv.address?.pincode || "")
                setLatitude(inv.location?.coordinates?.[1] || inv.address?.latitude || 0)
                setLongitude(inv.location?.coordinates?.[0] || inv.address?.longitude || 0)
                setDeliveryRadiusKm(inv.deliveryRadiusKm || 15)
                setIsActive(inv.isActive !== undefined ? inv.isActive : true)

                // Populate stock map from inventory items
                const newStockMap: { [id: string]: { quantity: number; isAvailable: boolean } } = {}
                if (Array.isArray(inv.items)) {
                    inv.items.forEach((item: any) => {
                        const gId = item.grocery?._id ? item.grocery._id.toString() : item.grocery?.toString()
                        if (gId) {
                            newStockMap[gId] = {
                                quantity: item.quantity !== undefined ? item.quantity : 0,
                                isAvailable: item.isAvailable !== undefined ? item.isAvailable : true
                            }
                        }
                    })
                }
                setStockMap(newStockMap)
            }
        } catch (error: any) {
            console.error("Error loading inventory:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser")
            return
        }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude
                const lon = pos.coords.longitude
                setLatitude(lat)
                setLongitude(lon)

                try {
                    const res = await axios.get(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
                    )
                    if (res.data?.address) {
                        setCity(res.data.address.city || res.data.address.town || "")
                        setState(res.data.address.state || "")
                        setPincode(res.data.address.postcode || "")
                        setFullAddress(res.data.display_name || "")
                    }
                } catch (e) {
                    console.error("Reverse geocoding error:", e)
                }
            },
            (err) => {
                alert(`Error getting location: ${err.message}`)
            },
            { enableHighAccuracy: true }
        )
    }

    const handleSaveStoreDetails = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!storeName.trim()) {
            alert("Please enter a name for your personal inventory store")
            return
        }

        try {
            setSavingDetails(true)
            setStatusMessage(null)

            // Construct items payload from stockMap
            const itemsPayload = Object.entries(stockMap).map(([groceryId, stock]) => ({
                grocery: groceryId,
                quantity: stock.quantity,
                isAvailable: stock.isAvailable
            }))

            await axios.post("/api/admin/inventory", {
                name: storeName,
                address: {
                    fullAddress,
                    city,
                    state,
                    pincode,
                    latitude,
                    longitude
                },
                deliveryRadiusKm,
                isActive,
                items: itemsPayload
            })

            setStatusMessage("Store configuration saved successfully!")
            setTimeout(() => setStatusMessage(null), 4000)
        } catch (error: any) {
            console.error("Error saving store details:", error)
            alert(error.response?.data?.message || "Failed to save inventory configuration")
        } finally {
            setSavingDetails(false)
        }
    }

    const handleStockChange = (groceryId: string, quantity: number, isAvailable: boolean) => {
        setStockMap((prev) => ({
            ...prev,
            [groceryId]: {
                quantity: Math.max(0, quantity),
                isAvailable: quantity === 0 ? false : isAvailable
            }
        }))
    }

    const handleToggleAvailability = (groceryId: string) => {
        setStockMap((prev) => {
            const current = prev[groceryId] || { quantity: 10, isAvailable: false }
            const newAvailable = !current.isAvailable
            return {
                ...prev,
                [groceryId]: {
                    quantity: newAvailable && current.quantity === 0 ? 10 : current.quantity,
                    isAvailable: newAvailable
                }
            }
        })
    }

    const handleSaveAllStock = async () => {
        try {
            setSavingStock(true)
            const itemsPayload = groceries.map((g) => {
                const stock = stockMap[g._id] || { quantity: 0, isAvailable: false }
                return {
                    groceryId: g._id,
                    quantity: stock.quantity,
                    isAvailable: stock.isAvailable
                }
            })

            await axios.post("/api/admin/inventory/update-stock", { items: itemsPayload })
            setStatusMessage("All stock and availability changes saved!")
            setTimeout(() => setStatusMessage(null), 4000)
        } catch (error: any) {
            console.error("Error updating stock:", error)
            alert(error.response?.data?.message || "Failed to update stock")
        } finally {
            setSavingStock(false)
        }
    }

    // Set all products to In-Stock with default quantity
    const handleSetAllInStock = () => {
        const newMap: { [id: string]: { quantity: number; isAvailable: boolean } } = { ...stockMap }
        groceries.forEach((g) => {
            newMap[g._id] = {
                quantity: (newMap[g._id]?.quantity && newMap[g._id].quantity > 0) ? newMap[g._id].quantity : 25,
                isAvailable: true
            }
        })
        setStockMap(newMap)
    }

    const categories = ["all", ...Array.from(new Set(groceries.map((g) => g.category)))]

    const filteredGroceries = groceries.filter((g) => {
        const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.category.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = selectedCategory === "all" || g.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const inStockCount = Object.values(stockMap).filter((s) => s.isAvailable && s.quantity > 0).length
    const outOfStockCount = groceries.length - inStockCount

    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <div className='flex flex-col items-center gap-3 text-green-700'>
                    <Loader2 className='w-10 h-10 animate-spin' />
                    <p className='font-semibold'>Loading your personal inventory...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-slate-50 text-gray-800 pb-28 pt-8'>
            <div className='w-[95%] md:w-[88%] max-w-7xl mx-auto'>
                {/* Header navigation */}
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
                    <div className='flex items-center gap-4'>
                        <Link
                            href="/"
                            className='flex items-center justify-center gap-2 bg-white text-green-700 border border-green-200 px-4 py-2.5 rounded-full shadow-sm hover:bg-green-50 transition-all font-medium text-sm'
                        >
                            <ArrowLeft size={18} />
                            <span>Home Dashboard</span>
                        </Link>
                        <div>
                            <h1 className='text-2xl md:text-3xl font-extrabold text-green-800 flex items-center gap-2'>
                                <Store className='w-8 h-8 text-green-600' />
                                My Personal Inventory
                            </h1>
                            <p className='text-xs sm:text-sm text-gray-500 mt-0.5'>
                                Manage your dark store location, delivery radius, and real-time product stock availability.
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center gap-3'>
                        <button
                            onClick={handleSaveAllStock}
                            disabled={savingStock}
                            className='flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-sm'
                        >
                            {savingStock ? <Loader2 size={16} className='animate-spin' /> : <Save size={16} />}
                            <span>Save Stock Changes</span>
                        </button>
                    </div>
                </div>

                {/* Status toast */}
                <AnimatePresence>
                    {statusMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className='bg-green-100 border border-green-300 text-green-800 px-5 py-3 rounded-xl mb-6 shadow-sm flex items-center justify-between font-medium'
                        >
                            <span>✓ {statusMessage}</span>
                            <button onClick={() => setStatusMessage(null)} className='text-xs underline'>Dismiss</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Metric Summary Cards */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
                    <div className='bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center'>
                            <Package size={24} />
                        </div>
                        <div>
                            <p className='text-xs text-gray-500 font-medium'>Catalog Products</p>
                            <p className='text-2xl font-bold text-gray-800'>{groceries.length}</p>
                        </div>
                    </div>
                    <div className='bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center'>
                            <Eye size={24} />
                        </div>
                        <div>
                            <p className='text-xs text-gray-500 font-medium'>In Stock & Available</p>
                            <p className='text-2xl font-bold text-green-600'>{inStockCount}</p>
                        </div>
                    </div>
                    <div className='bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center'>
                            <EyeOff size={24} />
                        </div>
                        <div>
                            <p className='text-xs text-gray-500 font-medium'>Out of Stock</p>
                            <p className='text-2xl font-bold text-amber-600'>{outOfStockCount}</p>
                        </div>
                    </div>
                    <div className='bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center'>
                            <Globe size={24} />
                        </div>
                        <div>
                            <p className='text-xs text-gray-500 font-medium'>Store Status</p>
                            <p className={`text-base font-bold ${isActive ? 'text-green-600' : 'text-red-500'}`}>
                                {isActive ? 'Active (Delivering)' : 'Offline'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    {/* Left Column: Store Configuration Form */}
                    <div className='lg:col-span-1'>
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-28'
                        >
                            <div className='flex items-center justify-between pb-4 border-b border-gray-100 mb-6'>
                                <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                                    <MapPin size={20} className='text-green-600' />
                                    Inventory Store Info
                                </h2>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                    {isActive ? 'Live' : 'Paused'}
                                </span>
                            </div>

                            <form onSubmit={handleSaveStoreDetails} className='space-y-4'>
                                <div>
                                    <label className='block text-xs font-semibold text-gray-600 mb-1'>
                                        Store / Darkstore Name <span className='text-red-500'>*</span>
                                    </label>
                                    <input
                                        type='text'
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                        placeholder='e.g., Central Darkstore #1, South Hub'
                                        className='w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-400 outline-none transition bg-gray-50 focus:bg-white'
                                        required
                                    />
                                </div>

                                <div>
                                    <label className='block text-xs font-semibold text-gray-600 mb-1'>
                                        Delivery Radius (in Kilometers)
                                    </label>
                                    <div className='flex items-center gap-2'>
                                        <input
                                            type='number'
                                            min={1}
                                            max={100}
                                            value={deliveryRadiusKm}
                                            onChange={(e) => setDeliveryRadiusKm(Number(e.target.value))}
                                            className='w-24 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-green-400 outline-none transition bg-gray-50 focus:bg-white'
                                        />
                                        <span className='text-xs text-gray-500'>km around this store</span>
                                    </div>
                                </div>

                                <div className='pt-2 border-t border-gray-100'>
                                    <div className='flex items-center justify-between mb-2'>
                                        <label className='block text-xs font-semibold text-gray-600'>Store Coordinates (GPS)</label>
                                        <button
                                            type='button'
                                            onClick={handleDetectLocation}
                                            className='flex items-center gap-1 text-xs text-green-700 hover:text-green-800 font-semibold bg-green-50 px-2.5 py-1 rounded-lg border border-green-200'
                                        >
                                            <Crosshair size={13} />
                                            Detect GPS
                                        </button>
                                    </div>
                                    <div className='grid grid-cols-2 gap-2'>
                                        <input
                                            type='number'
                                            step='any'
                                            value={latitude}
                                            onChange={(e) => setLatitude(Number(e.target.value))}
                                            placeholder='Latitude'
                                            className='w-full border border-gray-200 rounded-xl px-3 py-2 text-xs bg-gray-50'
                                        />
                                        <input
                                            type='number'
                                            step='any'
                                            value={longitude}
                                            onChange={(e) => setLongitude(Number(e.target.value))}
                                            placeholder='Longitude'
                                            className='w-full border border-gray-200 rounded-xl px-3 py-2 text-xs bg-gray-50'
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className='block text-xs font-semibold text-gray-600 mb-1'>Full Address</label>
                                    <textarea
                                        rows={2}
                                        value={fullAddress}
                                        onChange={(e) => setFullAddress(e.target.value)}
                                        placeholder='Street address or warehouse location'
                                        className='w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none transition bg-gray-50 focus:bg-white'
                                    />
                                </div>

                                <div className='grid grid-cols-2 gap-2'>
                                    <div>
                                        <label className='block text-xs font-semibold text-gray-600 mb-1'>City</label>
                                        <input
                                            type='text'
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder='City'
                                            className='w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-xs font-semibold text-gray-600 mb-1'>Pincode</label>
                                        <input
                                            type='text'
                                            value={pincode}
                                            onChange={(e) => setPincode(e.target.value)}
                                            placeholder='e.g., 560001'
                                            className='w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50'
                                        />
                                    </div>
                                </div>

                                <div className='flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200'>
                                    <span className='text-xs font-semibold text-gray-700'>Store Active for Orders</span>
                                    <input
                                        type='checkbox'
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                        className='w-4 h-4 text-green-600 rounded focus:ring-green-500 accent-green-600 cursor-pointer'
                                    />
                                </div>

                                <button
                                    type='submit'
                                    disabled={savingDetails}
                                    className='w-full mt-3 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50'
                                >
                                    {savingDetails ? <Loader2 size={16} className='animate-spin' /> : <Save size={16} />}
                                    Save Store Settings
                                </button>
                            </form>
                        </motion.div>
                    </div>

                    {/* Right Column: Products Availability & Stock Management */}
                    <div className='lg:col-span-2 space-y-6'>
                        {/* Filter & Quick Actions Bar */}
                        <div className='bg-white p-5 rounded-3xl shadow-xs border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4'>
                            <div className='relative w-full md:w-72'>
                                <Search size={18} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400' />
                                <input
                                    type='text'
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder='Search products...'
                                    className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-green-400 bg-gray-50'
                                />
                            </div>

                            <div className='flex items-center gap-3 w-full md:w-auto overflow-x-auto'>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className='border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white text-gray-700 outline-none focus:ring-2 focus:ring-green-400'
                                >
                                    {categories.map((c) => (
                                        <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
                                    ))}
                                </select>

                                <button
                                    type='button'
                                    onClick={handleSetAllInStock}
                                    className='flex items-center gap-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all'
                                >
                                    <Sparkles size={14} />
                                    Mark All In-Stock
                                </button>
                            </div>
                        </div>

                        {/* Product Stock Table / Cards */}
                        <div className='space-y-3'>
                            {filteredGroceries.length === 0 ? (
                                <div className='bg-white p-12 text-center rounded-3xl border border-gray-100 shadow-xs'>
                                    <Package size={40} className='mx-auto text-gray-300 mb-3' />
                                    <p className='text-gray-500 font-medium'>No products match your filter.</p>
                                </div>
                            ) : (
                                filteredGroceries.map((item) => {
                                    const stockInfo = stockMap[item._id] || { quantity: 0, isAvailable: false }
                                    const isAvailable = stockInfo.isAvailable && stockInfo.quantity > 0

                                    return (
                                        <motion.div
                                            key={item._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={`bg-white rounded-2xl p-4 border transition-all shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 ${
                                                isAvailable ? 'border-gray-100 hover:border-green-300' : 'border-red-100 bg-red-50/20'
                                            }`}
                                        >
                                            <div className='flex items-center gap-4 w-full sm:w-auto'>
                                                <div className='relative w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0'>
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className='object-contain p-1'
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className='font-bold text-gray-800 text-sm md:text-base line-clamp-1'>
                                                        {item.name}
                                                    </h3>
                                                    <p className='text-xs text-gray-400 capitalize'>{item.category}</p>
                                                    <p className='text-xs font-bold text-green-700 mt-0.5'>
                                                        ₹{item.price} / <span className='font-normal text-gray-500'>{item.unit}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Stock controls */}
                                            <div className='flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto'>
                                                {/* Quantity Input */}
                                                <div className='flex flex-col items-center'>
                                                    <label className='text-[10px] text-gray-400 font-medium mb-1'>Stock Units</label>
                                                    <input
                                                        type='number'
                                                        min={0}
                                                        max={9999}
                                                        value={stockInfo.quantity}
                                                        onChange={(e) =>
                                                            handleStockChange(item._id, Number(e.target.value), stockInfo.isAvailable)
                                                        }
                                                        className='w-20 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-green-400'
                                                    />
                                                </div>

                                                {/* Availability Toggle */}
                                                <div className='flex flex-col items-center'>
                                                    <label className='text-[10px] text-gray-400 font-medium mb-1'>Status</label>
                                                    <button
                                                        type='button'
                                                        onClick={() => handleToggleAvailability(item._id)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                                                            isAvailable
                                                                ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                                                                : 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-300'
                                                        }`}
                                                    >
                                                        {isAvailable ? (
                                                            <>
                                                                <Check size={13} />
                                                                <span>Available</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <EyeOff size={13} />
                                                                <span>Out of Stock</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })
                            )}
                        </div>

                        {/* Bottom save bar */}
                        <div className='flex justify-end pt-4'>
                            <button
                                onClick={handleSaveAllStock}
                                disabled={savingStock}
                                className='flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 text-base'
                            >
                                {savingStock ? <Loader2 size={18} className='animate-spin' /> : <Save size={18} />}
                                <span>Save All Stock Changes</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
