import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import {
  Calendar,
  ShoppingBag,
  Coins,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react-native"
import { PageHeader } from "../../src/components/layout/PageHeader"
import { GlassCard } from "../../src/components/ui/GlassCard"
import { StatusBadge } from "../../src/components/ui/StatusBadge"
import { FloatingInput } from "../../src/components/ui/FloatingInput"
import { useAuth } from "../../src/context/AuthContext"
import { apiFetch } from "../../src/api/client"
import { formatRupiah, formatDateTime } from "../../src/lib/format"

type TabKey = "bookings" | "products" | "points"

interface BookingHistory {
  id: string
  booking_code: string
  customer_name: string
  barber_name?: string
  booking_date: string
  booking_time: string
  total_amount: number
  booking_status?: string
  is_confirmed?: number
  services?: { id: string; name: string }[]
}

interface ProductOrderHistory {
  id: string
  order_code: string
  total_amount: number
  payment_status: string
  created_at: string
  items?: { name: string; quantity: number }[]
}

interface PointHistoryItem {
  id: string
  point_change: number | string
  tanggal: string
  activity: string
  booking_code?: string | null
}

export default function MemberHistoryScreen() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabKey>("bookings")
  const [search, setSearch] = useState("")

  const [bookings, setBookings] = useState<BookingHistory[]>([])
  const [products, setProducts] = useState<ProductOrderHistory[]>([])
  const [points, setPoints] = useState<PointHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    async function loadAllHistory() {
      try {
        setLoading(true)
        const [resBookings, resProducts, resPoints] = await Promise.allSettled([
          apiFetch<any[]>(`/api/bookings/member/${user?.id}`),
          apiFetch<any[]>("/api/products/orders/mine"),
          apiFetch<any[]>(`/api/users/points/history?uid=${user?.id}`),
        ])

        if (resBookings.status === "fulfilled" && Array.isArray(resBookings.value)) {
          setBookings(resBookings.value)
        }
        if (resProducts.status === "fulfilled" && Array.isArray(resProducts.value)) {
          setProducts(resProducts.value)
        }
        if (resPoints.status === "fulfilled" && Array.isArray(resPoints.value)) {
          setPoints(resPoints.value)
        }
      } catch (err) {
        console.warn("Failed fetching history:", err)
      } finally {
        setLoading(false)
      }
    }

    loadAllHistory()
  }, [user?.id])

  const filteredBookings = bookings.filter((b) =>
    (b.booking_code || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.barber_name || "").toLowerCase().includes(search.toLowerCase())
  )

  const filteredProducts = products.filter((p) =>
    (p.order_code || "").toLowerCase().includes(search.toLowerCase())
  )

  const filteredPoints = points.filter((pt) =>
    (pt.activity || "").toLowerCase().includes(search.toLowerCase()) ||
    (pt.booking_code || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      <PageHeader
        title="Riwayat Aktivitas"
        subtitle="Daftar seluruh riwayat booking, belanja produk, dan perolehan poinmu"
      />

      {/* 3 TABS */}
      <View className="flex-row bg-slate-900/90 p-1 rounded-2xl border border-slate-800 mb-4">
        {[
          { key: "bookings" as TabKey, label: "Booking", icon: Calendar, count: bookings.length },
          { key: "products" as TabKey, label: "Produk", icon: ShoppingBag, count: products.length },
          { key: "points" as TabKey, label: "Poin", icon: Coins, count: points.length },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-xl flex-row items-center justify-center ${
                isActive ? "bg-blue-600 border border-cyan-400/50 shadow" : ""
              }`}
            >
              <Icon size={14} color={isActive ? "#FFFFFF" : "#94A3B8"} />
              <Text className={`text-xs ml-1.5 font-bold ${isActive ? "text-white" : "text-slate-400"}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Search Input */}
      <View className="mb-4">
        <FloatingInput
          label="Cari transaksi..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#22D3EE" className="py-8" />
      ) : (
        <View className="gap-3 mb-10">
          {/* TAB 1: BOOKING */}
          {activeTab === "bookings" && (
            filteredBookings.length === 0 ? (
              <GlassCard className="p-6 items-center">
                <Text className="text-slate-400 text-xs">Tidak ada riwayat booking.</Text>
              </GlassCard>
            ) : (
              filteredBookings.map((b) => (
                <GlassCard key={b.id} className="p-4 border-slate-800">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-cyan-400 font-extrabold text-xs">{b.booking_code}</Text>
                    <StatusBadge status={b.booking_status || (Number(b.is_confirmed) === 1 ? "CONFIRMED" : "PENDING")} />
                  </View>
                  <View className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 mb-2 space-y-1">
                    <View className="flex-row justify-between">
                      <Text className="text-slate-400 text-xs">Capster</Text>
                      <Text className="text-slate-200 text-xs font-semibold">{b.barber_name || "-"}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-slate-400 text-xs">Jadwal</Text>
                      <Text className="text-slate-200 text-xs">{b.booking_date} @ {b.booking_time}</Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-400 text-xs">Total Pembayaran</Text>
                    <Text className="text-cyan-300 font-bold text-xs">{formatRupiah(b.total_amount)}</Text>
                  </View>
                </GlassCard>
              ))
            )
          )}

          {/* TAB 2: PRODUK */}
          {activeTab === "products" && (
            filteredProducts.length === 0 ? (
              <GlassCard className="p-6 items-center">
                <Text className="text-slate-400 text-xs">Tidak ada riwayat belanja produk.</Text>
              </GlassCard>
            ) : (
              filteredProducts.map((p) => (
                <GlassCard key={p.id} className="p-4 border-slate-800">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-purple-400 font-extrabold text-xs">{p.order_code}</Text>
                    <StatusBadge status={p.payment_status} />
                  </View>
                  <Text className="text-slate-400 text-[10px] mb-2">{formatDateTime(p.created_at)}</Text>
                  <View className="flex-row justify-between items-center pt-2 border-t border-slate-800">
                    <Text className="text-slate-400 text-xs">Total Tagihan</Text>
                    <Text className="text-cyan-300 font-bold text-xs">{formatRupiah(p.total_amount)}</Text>
                  </View>
                </GlassCard>
              ))
            )
          )}

          {/* TAB 3: POIN */}
          {activeTab === "points" && (
            filteredPoints.length === 0 ? (
              <GlassCard className="p-6 items-center">
                <Text className="text-slate-400 text-xs">Tidak ada riwayat mutasi poin.</Text>
              </GlassCard>
            ) : (
              filteredPoints.map((pt, idx) => (
                <GlassCard key={pt.id || idx} className="p-3.5 border-slate-800 flex-row justify-between items-center">
                  <View className="flex-1 mr-2">
                    <Text className="text-white font-semibold text-xs mb-0.5">{pt.activity}</Text>
                    <Text className="text-slate-500 text-[10px]">{formatDateTime(pt.tanggal)}</Text>
                    {pt.booking_code && (
                      <Text className="text-cyan-400 text-[10px] mt-0.5">Booking: {pt.booking_code}</Text>
                    )}
                  </View>
                  <Text
                    className={`font-extrabold text-xs ${
                      Number(pt.point_change) >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {Number(pt.point_change) >= 0 ? `+${pt.point_change}` : pt.point_change} Poin
                  </Text>
                </GlassCard>
              ))
            )
          )}
        </View>
      )}
    </ScrollView>
  )
}

