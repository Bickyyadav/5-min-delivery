import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import Inventory from "@/models/inventory.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const { userId, items, paymentMethod, totalAmount, address, inventoryId } = await req.json();
        
        if (!items || !userId || !paymentMethod || !totalAmount || !address) {
            return NextResponse.json(
                { message: "Please provide all required order details." },
                { status: 400 }
            );
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 400 }
            );
        }

        let assignedInventoryId = inventoryId;
        let inventory = null;

        if (assignedInventoryId) {
            inventory = await Inventory.findById(assignedInventoryId);
        } else {
            // Auto-detect closest or active inventory if none explicitly provided
            inventory = await Inventory.findOne({ isActive: true });
            if (inventory) {
                assignedInventoryId = inventory._id;
            }
        }

        // Validate stock in inventory if an inventory exists
        if (inventory) {
            for (const orderItem of items) {
                const groceryId = orderItem.grocery?.toString() || orderItem._id?.toString();
                const invItem = inventory.items.find((i: any) => i.grocery.toString() === groceryId);
                
                if (!invItem || !invItem.isAvailable || (invItem.quantity !== undefined && invItem.quantity < (orderItem.quantity || 1))) {
                    return NextResponse.json(
                        { 
                            message: `Product "${orderItem.name}" is not available for delivery from ${inventory.name}. Available stock: ${invItem?.quantity || 0}`,
                            unavailableItem: orderItem.name
                        },
                        { status: 400 }
                    );
                }
            }

            // Deduct stock from inventory
            for (const orderItem of items) {
                const groceryId = orderItem.grocery?.toString() || orderItem._id?.toString();
                const invItem = inventory.items.find((i: any) => i.grocery.toString() === groceryId);
                if (invItem && invItem.quantity !== undefined) {
                    invItem.quantity = Math.max(0, invItem.quantity - (orderItem.quantity || 1));
                    if (invItem.quantity === 0) {
                        invItem.isAvailable = false;
                    }
                }
            }
            await inventory.save();
        }

        const newOrder = await Order.create({
            user: userId,
            items,
            paymentMethod,
            totalAmount,
            address,
            inventory: assignedInventoryId || null
        });

        // Notify admins / socket listeners
        await emitEventHandler("new-order", newOrder);

        // If inventory has an assigned admin, notify them directly if online
        if (inventory?.admin) {
            const adminUser = await User.findById(inventory.admin);
            if (adminUser?.socketId) {
                await emitEventHandler("new-order", newOrder, adminUser.socketId);
            }
        }

        return NextResponse.json(
            newOrder,
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Place order error:", error);
        return NextResponse.json(
            { message: `Place order error: ${error?.message || error}` },
            { status: 500 }
        );
    }
}