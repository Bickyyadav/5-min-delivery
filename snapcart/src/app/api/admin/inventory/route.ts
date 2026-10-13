import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Inventory from "@/models/inventory.model";
import Grocery from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";

// GET admin's personal inventory
export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session?.user?.id || session?.user?.role !== "admin") {
            return NextResponse.json(
                { message: "Unauthorized - Admin only" },
                { status: 401 }
            );
        }

        const adminId = session.user.id;
        let inventory = await Inventory.findOne({ admin: adminId }).populate("items.grocery");

        // Also fetch all groceries so admin can see full catalog to add/manage stock
        const allGroceries = await Grocery.find({}).sort({ createdAt: -1 });

        return NextResponse.json({
            inventory,
            allGroceries
        }, { status: 200 });

    } catch (error: any) {
        console.error("GET Admin Inventory Error:", error);
        return NextResponse.json(
            { message: `Error fetching inventory: ${error?.message || error}` },
            { status: 500 }
        );
    }
}

// POST create or update admin's personal inventory
export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session?.user?.id || session?.user?.role !== "admin") {
            return NextResponse.json(
                { message: "Unauthorized - Admin only" },
                { status: 401 }
            );
        }

        const adminId = session.user.id;
        const body = await req.json();
        const { name, address, deliveryRadiusKm, isActive, items } = body;

        if (!name) {
            return NextResponse.json(
                { message: "Inventory/Store name is required" },
                { status: 400 }
            );
        }

        const latitude = Number(address?.latitude || 0);
        const longitude = Number(address?.longitude || 0);

        const location = {
            type: "Point",
            coordinates: [longitude, latitude] // GeoJSON: [lng, lat]
        };

        const updateData: any = {
            name,
            address: {
                fullAddress: address?.fullAddress || "",
                city: address?.city || "",
                state: address?.state || "",
                pincode: address?.pincode || "",
                latitude,
                longitude
            },
            location,
            deliveryRadiusKm: deliveryRadiusKm ? Number(deliveryRadiusKm) : 15,
            isActive: isActive !== undefined ? Boolean(isActive) : true
        };

        if (Array.isArray(items)) {
            updateData.items = items;
        }

        const inventory = await Inventory.findOneAndUpdate(
            { admin: adminId },
            { $set: updateData },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).populate("items.grocery");

        return NextResponse.json({
            message: "Personal inventory saved successfully",
            inventory
        }, { status: 200 });

    } catch (error: any) {
        console.error("POST Admin Inventory Error:", error);
        return NextResponse.json(
            { message: `Error saving inventory: ${error?.message || error}` },
            { status: 500 }
        );
    }
}
