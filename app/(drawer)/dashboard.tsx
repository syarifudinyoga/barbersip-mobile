import React from "react"
import { View, Text } from "react-native"
import { useAuth } from "../../src/context/AuthContext"
import { MemberDashboardView } from "../../src/components/dashboard/MemberDashboardView"
import { CapsterDashboardView } from "../../src/components/dashboard/CapsterDashboardView"
import { AdminDashboardView } from "../../src/components/dashboard/AdminDashboardView"
import { SuperadminDashboardView } from "../../src/components/dashboard/SuperadminDashboardView"

export default function DashboardScreen() {
  const { user } = useAuth()

  if (!user) return null

  switch (user.role) {
    case "superadmin":
      return <SuperadminDashboardView />
    case "admin":
      return <AdminDashboardView />
    case "capster":
    case "barber":
      return <CapsterDashboardView />
    case "member":
      return <MemberDashboardView />
    default:
      return (
        <View className="py-8 items-center">
          <Text className="text-white text-base font-bold">Role tidak dikenali: {user.role}</Text>
        </View>
      )
  }
}

