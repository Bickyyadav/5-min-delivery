import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl
    const publicRoutes = ["/login", "/register", "/api/auth", "/unauthorized"]
    if (publicRoutes.some((path) => pathname.startsWith(path))) {
        return NextResponse.next()
    }
    const session = await auth()
    if (!session) {
        // Suppose the user is currently visiting:"https://example.com/dashboard"then this creates this "https://example.com/login"
        const loginUrl = new URL("/login", req.url)
        // This adds a query parameter called callbackUrl.If the user was trying to visit: /dashboard the login URL becomes something like: https://example.com/login?callbackUrl=https://example.com/dashboard
        loginUrl.searchParams.set("callbackUrl", req.url)
        // After you log in, remember to take me back to /dashboard.
        return NextResponse.redirect(loginUrl)
    }

    const role = session?.user?.role
    console.log("🚀 ~ proxy ~ role:", role)
    if (pathname.startsWith("/user") && role != "user") {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
    if (pathname.startsWith("/delivery") && role !== "deliveryBoy") {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
    if (pathname.startsWith("/admin") && role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
    return NextResponse.next()
}

export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}