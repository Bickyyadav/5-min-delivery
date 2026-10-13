import connectDb from "@/lib/db";
import Inventory from "@/models/inventory.model";
import { NextRequest, NextResponse } from "next/server";

// Helper: Haversine distance in KM
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const { searchParams } = new URL(req.url);
        const lat = searchParams.get("lat");
        const lon = searchParams.get("lon");
        const inventoryId = searchParams.get("id");

        if (inventoryId) {
            const inventory = await Inventory.findById(inventoryId).populate("items.grocery admin", "name email mobile");
            if (!inventory) {
                return NextResponse.json({ message: "Inventory not found" }, { status: 404 });
            }
            return NextResponse.json({ inventory }, { status: 200 });
        }

        const inventories = await Inventory.find({ isActive: true }).populate("admin", "name email mobile");

        let nearestInventory = null;
        let enrichedInventories = inventories.map((inv: any) => {
            const invLat = inv.location?.coordinates?.[1] || inv.address?.latitude || 0;
            const invLon = inv.location?.coordinates?.[0] || inv.address?.longitude || 0;
            let distanceKm: number | null = null;

            if (lat && lon && !isNaN(Number(lat)) && !isNaN(Number(lon)) && invLat && invLon) {
                distanceKm = Number(calculateDistance(Number(lat), Number(lon), invLat, invLon).toFixed(2));
            }

            return {
                _id: inv._id,
                name: inv.name,
                admin: inv.admin,
                address: inv.address,
                location: inv.location,
                deliveryRadiusKm: inv.deliveryRadiusKm || 15,
                isActive: inv.isActive,
                distanceKm,
                itemsCount: inv.items?.length || 0
            };
        });

        if (lat && lon && enrichedInventories.length > 0) {
            // Sort by distance
            enrichedInventories.sort((a, b) => {
                if (a.distanceKm === null) return 1;
                if (b.distanceKm === null) return -1;
                return a.distanceKm - b.distanceKm;
            });
            nearestInventory = enrichedInventories[0];
        } else if (enrichedInventories.length > 0) {
            nearestInventory = enrichedInventories[0];
        }

        return NextResponse.json({
            inventories: enrichedInventories,
            nearestInventory
        }, { status: 200 });

    } catch (error: any) {
        console.error("GET Inventories List Error:", error);
        return NextResponse.json(
            { message: `Error fetching inventories: ${error?.message || error}` },
            { status: 500 }
        );
    }
}
