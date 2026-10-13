import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        return NextResponse.json(
            { adminExist: false },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json(
            { message: `check for admin error ${error}` },
            { status: 500 }
        )
    }
}