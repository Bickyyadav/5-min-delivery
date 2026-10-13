import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Inventory from "@/models/inventory.model";
import { NextRequest, NextResponse } from "next/server";

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
        const { groceryId, quantity, isAvailable, items } = await req.json();

        let inventory = await Inventory.findOne({ admin: adminId });
        if (!inventory) {
            return NextResponse.json(
                { message: "Please create your inventory first before managing stock" },
                { status: 404 }
            );
        }

        // Bulk update
        if (Array.isArray(items)) {
            for (const item of items) {
                const idx = inventory.items.findIndex((i: any) => i.grocery.toString() === item.groceryId.toString());
                if (idx > -1) {
                    if (item.quantity !== undefined) inventory.items[idx].quantity = Math.max(0, Number(item.quantity));
                    if (item.isAvailable !== undefined) inventory.items[idx].isAvailable = Boolean(item.isAvailable);
                } else {
                    inventory.items.push({
                        grocery: item.groceryId,
                        quantity: Math.max(0, Number(item.quantity || 0)),
                        isAvailable: item.isAvailable !== undefined ? Boolean(item.isAvailable) : true
                    });
                }
            }
        } else if (groceryId) {
            // Single item update
            const idx = inventory.items.findIndex((i: any) => i.grocery.toString() === groceryId.toString());
            if (idx > -1) {
                if (quantity !== undefined) inventory.items[idx].quantity = Math.max(0, Number(quantity));
                if (isAvailable !== undefined) inventory.items[idx].isAvailable = Boolean(isAvailable);
            } else {
                inventory.items.push({
                    grocery: groceryId,
                    quantity: Math.max(0, Number(quantity || 0)),
                    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true
                });
            }
        } else {
            return NextResponse.json(
                { message: "groceryId or items array required" },
                { status: 400 }
            );
        }

        await inventory.save();
        await inventory.populate("items.grocery");

        return NextResponse.json({
            message: "Stock updated successfully",
            inventory
        }, { status: 200 });

    } catch (error: any) {
        console.error("Update stock error:", error);
        return NextResponse.json(
            { message: `Error updating stock: ${error?.message || error}` },
            { status: 500 }
        );
    }
}
