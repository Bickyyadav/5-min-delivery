import React from 'react'
import HeroSection from './HeroSection'
import CategorySlider from './CategorySlider'
import GroceryItemCard from './GroceryItemCard'


interface Props {
    groceryList: any[];
    selectedInventory?: any;
    isServiceable?: boolean;
    distanceKm?: number | null;
}

const UserDashboard = ({ groceryList, selectedInventory, isServiceable = false, distanceKm = null }: Props) => {
    const plainGrocery = JSON.parse(JSON.stringify(groceryList || []))
    const plainSelectedInv = selectedInventory ? JSON.parse(JSON.stringify(selectedInventory)) : null

    return (
        <div className="pb-24 bg-white min-h-screen">
            <HeroSection />
            <CategorySlider />


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <div className='flex items-center justify-between mb-8'>
                    <div>
                        <h2 className="text-2xl font-extrabold text-green-800">Popular Grocery Items</h2>
                        <p className='text-xs text-gray-500 mt-1'>
                            {isServiceable && plainSelectedInv
                                ? `Live stock and availability synchronized with your nearest store: ${plainSelectedInv.name}.`
                                : "Browsing catalog items. Ordering is only enabled when within 10 km of an active darkstore."}
                        </p>
                    </div>
                </div>

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