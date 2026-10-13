import React from 'react'
import Link from 'next/link'
import {
    Zap,
    Clock,
    ShieldCheck,
    Truck,
    Headphones,
    Smartphone,
    Mail,
    Phone,
    MapPin,
    Heart,
    ArrowRight,
    Sparkles,
    CheckCircle2
} from 'lucide-react'

const Footer = () => {
    const popularCategories = [
        "Fresh Fruits & Vegetables",
        "Dairy, Bread & Eggs",
        "Snacks, Chips & Munchies",
        "Cold Drinks & Juices",
        "Instant Food & Noodles",
        "Tea, Coffee & Beverages",
        "Personal Care & Grooming",
        "Cleaning & Essentials",
    ]

    const quickLinks = [
        { label: "About Us", href: "#" },
        { label: "Careers", href: "#", badge: "Hiring" },
        { label: "Partner with Us", href: "#" },
        { label: "Become a Delivery Partner", href: "#" },
        { label: "Dark Store Network", href: "#" },
        { label: "Snapcart Blog", href: "#" },
        { label: "Press & News", href: "#" },
    ]

    const supportLinks = [
        { label: "Help & FAQs", href: "#" },
        { label: "Track Your Order", href: "#" },
        { label: "Returns & Refund Policy", href: "#" },
        { label: "Terms & Conditions", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Security & Safety", href: "#" },
        { label: "Contact Us", href: "#" },
    ]

    const deliveryCities = [
        "Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Pune",
        "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Chandigarh", "Lucknow"
    ]

    return (
        <footer className="w-full bg-slate-950 text-slate-300 border-t border-slate-800/80 mt-16 font-sans">
            {/* Top Value Propositions / Highlights */}
            <div className="border-b border-slate-800/60 bg-gradient-to-r from-slate-950 via-green-950/20 to-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Feature 1 */}
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-green-500/40 transition group">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 text-green-400 group-hover:scale-110 group-hover:bg-green-500/20 transition">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-white font-semibold text-base flex items-center gap-1.5">
                                    10-Min Fast Delivery
                                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                                </h4>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                    Dispatched instantly from local micro-fulfillment dark stores right around you.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-green-500/40 transition group">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 text-green-400 group-hover:scale-110 group-hover:bg-green-500/20 transition">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-white font-semibold text-base">Farm-Fresh Quality</h4>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                    Handpicked organic produce & 100% verified authentic grocery brands.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-green-500/40 transition group">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 text-green-400 group-hover:scale-110 group-hover:bg-green-500/20 transition">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-white font-semibold text-base">Best Prices & Offers</h4>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                    Direct pricing, bundle discounts, cashback & zero hidden convenience fees.
                                </p>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-green-500/40 transition group">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 text-green-400 group-hover:scale-110 group-hover:bg-green-500/20 transition">
                                <Headphones className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-white font-semibold text-base">Instant Help & Support</h4>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                    Hassle-free 1-tap refunds and 24/7 dedicated customer assistance.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* App Download Promo Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-slate-800/60">
                <div className="bg-gradient-to-r from-green-900/40 via-emerald-900/30 to-green-950/40 border border-green-500/20 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl backdrop-blur-md">
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold mb-3">
                            <Clock className="w-3.5 h-3.5" /> Zepto-Fast Grocery Experience
                        </div>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                            Get Groceries Delivered In <span className="text-green-400">10 Minutes</span>
                        </h3>
                        <p className="text-slate-400 text-sm mt-1 max-w-lg">
                            Download the Snapcart mobile app for exclusive deals, flash lightning sales, and real-time live rider tracking.
                        </p>
                    </div>

                    {/* Store Download Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                        <a
                            href="#"
                            className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl border border-slate-700/80 hover:border-green-500/50 transition-all shadow-md group"
                        >
                            <Smartphone className="w-6 h-6 text-green-400 group-hover:scale-110 transition" />
                            <div className="text-left">
                                <span className="block text-[10px] text-slate-400 uppercase tracking-wider leading-none">Download on</span>
                                <span className="text-xs sm:text-sm font-semibold tracking-wide">Google Play</span>
                            </div>
                        </a>
                        <a
                            href="#"
                            className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl border border-slate-700/80 hover:border-green-500/50 transition-all shadow-md group"
                        >
                            <svg className="w-6 h-6 text-green-400 group-hover:scale-110 transition fill-current" viewBox="0 0 24 24">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.08 1.74-.95 2.76 1.01.08 2.06-.51 2.68-1.26z" />
                            </svg>
                            <div className="text-left">
                                <span className="block text-[10px] text-slate-400 uppercase tracking-wider leading-none">Download on</span>
                                <span className="text-xs sm:text-sm font-semibold tracking-wide">App Store</span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Links Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
                    {/* Brand Info (takes 2 columns on lg) */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link href="/" className="inline-flex items-center gap-2 group">
                            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white group-hover:text-green-400 transition">
                                Snap<span className="text-green-500">cart</span>
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                                10m Express
                            </span>
                        </Link>

                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            Snapcart brings your neighborhood store to your pocket. Fresh fruits, dairy, snacks, daily groceries & late-night munchies delivered in 10 minutes flat.
                        </p>

                        {/* Contact details */}
                        <div className="space-y-2.5 pt-2 text-xs text-slate-400">
                            <div className="flex items-center gap-2.5">
                                <Mail className="w-4 h-4 text-green-400 shrink-0" />
                                <a href="mailto:support@snapcart.com" className="hover:text-white transition">
                                    support@snapcart.com
                                </a>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Phone className="w-4 h-4 text-green-400 shrink-0" />
                                <a href="tel:18001237627" className="hover:text-white transition">
                                    1800-123-SNAP (Toll Free)
                                </a>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <MapPin className="w-4 h-4 text-green-400 shrink-0" />
                                <span>Dark Stores across 15+ major metros</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="pt-2">
                            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-3">
                                Connect With Us
                            </p>
                            <div className="flex items-center gap-2.5">
                                {[
                                    { name: "Twitter/X", icon: "𝕏" },
                                    { name: "Instagram", icon: "📸" },
                                    { name: "LinkedIn", icon: "in" },
                                    { name: "Facebook", icon: "f" },
                                    { name: "YouTube", icon: "▶" }
                                ].map((social) => (
                                    <a
                                        key={social.name}
                                        href="#"
                                        aria-label={social.name}
                                        className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:border-green-500/50 hover:bg-green-500/10 hover:text-green-400 flex items-center justify-center text-xs font-bold transition-all shadow-sm"
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Categories Column */}
                    <div>
                        <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-green-500 pl-2">
                            Categories
                        </h4>
                        <ul className="space-y-2 text-xs text-slate-400">
                            {popularCategories.map((cat) => (
                                <li key={cat}>
                                    <Link
                                        href={`/?q=${encodeURIComponent(cat.split(" ")[0])}`}
                                        className="hover:text-green-400 hover:translate-x-1 inline-block transition-transform duration-150"
                                    >
                                        {cat}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick Links Column */}
                    <div>
                        <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-green-500 pl-2">
                            Company
                        </h4>
                        <ul className="space-y-2 text-xs text-slate-400">
                            {quickLinks.map((item) => (
                                <li key={item.label}>
                                    <a
                                        href={item.href}
                                        className="hover:text-green-400 hover:translate-x-1 inline-flex items-center gap-1.5 transition-transform duration-150"
                                    >
                                        {item.label}
                                        {item.badge && (
                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                                                {item.badge}
                                            </span>
                                        )}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support & Legal Column */}
                    <div>
                        <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-green-500 pl-2">
                            Help & Legal
                        </h4>
                        <ul className="space-y-2 text-xs text-slate-400">
                            {supportLinks.map((item) => (
                                <li key={item.label}>
                                    <a
                                        href={item.href}
                                        className="hover:text-green-400 hover:translate-x-1 inline-block transition-transform duration-150"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Cities Network Strip */}
                <div className="mt-12 pt-8 border-t border-slate-800/60">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                            <Truck className="w-4 h-4 text-green-400" />
                            <span>Express Delivery Cities:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {deliveryCities.map((city) => (
                                <span
                                    key={city}
                                    className="px-2.5 py-1 rounded-md text-[11px] bg-slate-900 border border-slate-800 text-slate-400 hover:text-green-400 hover:border-green-500/40 transition cursor-default"
                                >
                                    {city}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Copyright & Security Strip */}
            <div className="border-t border-slate-800/80 bg-slate-950/90 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p className="flex items-center gap-1">
                        © {new Date().getFullYear()} Snapcart Commerce Pvt. Ltd. Crafted with
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-current inline mx-0.5" />
                        for lightning 10-minute deliveries.
                    </p>

                    {/* Payment methods pill badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">100% Secure Payments:</span>
                        {["UPI", "Cards", "NetBanking", "COD"].map((method) => (
                            <span
                                key={method}
                                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-medium text-slate-400"
                            >
                                {method}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer