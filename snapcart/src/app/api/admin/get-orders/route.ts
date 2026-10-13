import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Inventory from "@/models/inventory.model";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();

        let filter: any = {};
        if (session?.user?.id) {
            const adminInventory = await Inventory.findOne({ admin: session.user.id });
            if (adminInventory) {
                // Return orders for this admin's personal inventory as well as unassigned legacy orders
                filter = {
                    $or: [
                        { inventory: adminInventory._id },
                        { inventory: null }
                    ]
                };
            }
        }

        const orders = await Order.find(filter)
            .populate("user assignedDeliveryBoy inventory")
            .sort({ createdAt: -1 });

        return NextResponse.json(
            orders, { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { message: `get orders error: ${error}` }, { status: 500 }
        );
    }
}