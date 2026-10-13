import React from 'react'
import HeroSection from './HeroSection'
import CategorySlider from './CategorySlider'
import GroceryItemCard from './GroceryItemCard'
import connectDb from '@/lib/db'
import Grocery, { IGrocery } from '@/models/grocery.model'


const UserDashboard = async ({ groceryList }: { groceryList: IGrocery[] }) => {
    await connectDb()
    const plainGrocery = JSON.parse(JSON.stringify(groceryList))

    return (
        <div className="pb-16 bg-white min-h-screen">
            <HeroSection />
            <CategorySlider />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <h2 className="text-2xl font-bold text-center text-green-700 mb-8">Popular Grocery Items</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {plainGrocery.map((item: any, index: any) => (
                        <GroceryItemCard key={item._id || index} item={item} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default UserDashboard