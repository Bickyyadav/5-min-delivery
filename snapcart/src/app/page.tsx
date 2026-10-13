
import Image from "next/image";
import { auth } from '@/auth'
import connectDb from '@/lib/db'
import User from '@/models/user.model'
import { redirect } from 'next/navigation'
import React from 'react'
import EditMobileRole from "@/components/EditMobileRole";
import Nav from "@/components/Nav";
import UserDashboard from "@/components/UserDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import DeliveryBoy from "@/components/DeliveryBoy";
import GeoUpdater from "@/components/GeoUpdater";
import Grocery, { IGrocery } from "@/models/grocery.model";
import Footer from "@/components/Footer";


export default async function Home(props: {
  searchParams: Promise<{
    q: string
  }>
}) {
  const searchParams = await props.searchParams
  await connectDb()
  const session = await auth()
  if (!session) redirect("/login")
  const user = await User.findById(session?.user?.id)
  if (!user) redirect("/login")
  const inComplete = !user.mobile || !user.role || (!user.mobile && user.role == "user")

  const plainUser = JSON.parse(JSON.stringify(user))

  if (inComplete) {
    return <EditMobileRole />
  }

  let groceryList: IGrocery[] = []
  if (user.role === "user") {
    groceryList = await Grocery.find({
      $or: [
        { name: { $regex: searchParams?.q || "", $options: "i" } },
        { category: { $regex: searchParams?.q || "", $options: "i" } },
      ]
    })

  } else {
    groceryList = await Grocery.find({})
  }

  return (
    <>
      <Nav user={plainUser} />
      <GeoUpdater userId={plainUser._id} />
      {
        user.role == "user" ? (<UserDashboard groceryList={groceryList} />) : user.role == "admin" ? (<AdminDashboard />) : <DeliveryBoy />
      }
      <Footer />
    </>
  );
}
