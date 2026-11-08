import React, { useState } from "react"
import { View, SafeAreaView, StatusBar, ActivityIndicator } from "react-native"
import { Slot, useRouter } from "expo-router"
import { GalaxyBackground } from "../../src/components/ui/GalaxyBackground"
import { MobileNavbar } from "../../src/components/layout/MobileNavbar"
import { RoleDrawer } from "../../src/components/layout/RoleDrawer"
import { useAuth } from "../../src/context/AuthContext"

export default function DrawerLayout() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Auth guard check
  if (loading) {
    return (
      <View className="flex-1 bg-[#030611] items-center justify-center">
        <ActivityIndicator size="large" color="#22D3EE" />
      </View>
    )
  }

  if (!user) {
    // Redirect ke login
    router.replace("/login")
    return null
  }

  return (
    <SafeAreaView className="flex-1 bg-[#030611]">
      <StatusBar barStyle="light-content" />
      <GalaxyBackground />

      {/* Top Navbar */}
      <MobileNavbar onOpenDrawer={() => setDrawerOpen(true)} />

      {/* Role Navigation Drawer */}
      <RoleDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Current Screen Content */}
      <View className="flex-1 px-4">
        <Slot />
      </View>
    </SafeAreaView>
  )
}

