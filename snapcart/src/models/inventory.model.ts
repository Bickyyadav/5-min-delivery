import mongoose from "mongoose";

export interface IInventoryItem {
    grocery: mongoose.Types.ObjectId;
    quantity: number;
    isAvailable: boolean;
}

export interface IInventory {
    _id?: mongoose.Types.ObjectId;
    name: string;
    admin: mongoose.Types.ObjectId;
    address: {
        fullAddress: string;
        city: string;
        state: string;
        pincode: string;
        latitude: number;
        longitude: number;
    };
    location: {
        type: string;
        coordinates: number[];
    };
    deliveryRadiusKm: number;
    items: IInventoryItem[];
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const inventorySchema = new mongoose.Schema<IInventory>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    address: {
        fullAddress: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        pincode: { type: String, default: "" },
        latitude: { type: Number, default: 0 },
        longitude: { type: Number, default: 0 }
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    deliveryRadiusKm: {
        type: Number,
        default: 15
    },
    items: [
        {
            grocery: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Grocery",
                required: true
            },
            quantity: {
                type: Number,
                default: 0
            },
            isAvailable: {
                type: Boolean,
                default: true
            }
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

inventorySchema.index({ location: "2dsphere" });

const Inventory = mongoose.models.Inventory || mongoose.model("Inventory", inventorySchema);
export default Inventory;
