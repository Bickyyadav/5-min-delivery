import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        return NextResponse.json({ suggestions: [] }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
    }
}
