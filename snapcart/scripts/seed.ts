// no dotenv needed

import mongoose from "mongoose";
import Grocery from "../src/models/grocery.model";

const dummyGroceries = [
    {
        _id: '64f1b2c3d4e5f6a7b8c9d0e1',
        name: 'Amul Milk',
        category: 'Dairy & Eggs',
        price: '80',
        unit: 'liter',
        image: 'https://res.cloudinary.com/dykpfaywh/image/upload/v1790938479/dsviysdkch7el45m1qbm.jpg'
    },
    {
        _id: '64f1b2c3d4e5f6a7b8c9d0e2',
        name: 'Aashirwad Aata 10kg',
        category: 'Rice, Atta & Grains',
        price: '400',
        unit: 'pack',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80'
    },
    {
        _id: '64f1b2c3d4e5f6a7b8c9d0e3',
        name: 'Apple 1kg',
        category: 'Fruits & Vegetables',
        price: '120',
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=500&q=80'
    }
];

const seed = async () => {
    try {
        const url = process.env.MONGODB_URL;
        if (!url) throw new Error("Missing MONGODB_URL");
        await mongoose.connect(url);
        console.log("Connected to MongoDB.");

        for (const item of dummyGroceries) {
            await Grocery.findByIdAndUpdate(item._id, item, { upsert: true, new: true });
            console.log(`Inserted/Updated: ${item.name}`);
        }

        console.log("Database seeded successfully.");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        await mongoose.disconnect();
    }
};

seed();
