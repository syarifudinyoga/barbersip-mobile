import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import {
  Banknote,
  Calendar,
  Clock,
  Scissors,
  ShoppingBag,
  CreditCard,
  ChevronRight,
  TrendingUp,
  RefreshCw,
} from "lucide-react-native"
import { GradientCard } from "../ui/GradientCard"
import { GlassCard } from "../ui/GlassCard"
import { SummaryCard } from "../ui/SummaryCard"
import { StatusBadge } from "../ui/StatusBadge"
import { apiFetch } from "../../api/client"
import { formatRupiah, formatDateTime } from "../../lib/format"
import { useAuth } from "../../context/AuthContext"

interface AdminBooking {
  id: string
  booking_code: string
  booking_date: string
  booking_time: string
  total_amount: number
  is_confirmed: number
  booking_status?: string
  barber_name?: string
  customer_name?: string
}

export function AdminDashboardView() {
  const router = useRouter()
  const { user } = useAuth()

  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const todayStr = now.toISOString().split("T")[0]

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<any>(`/api/bookings?month=${currentMonthStr}`)
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
      setBookings(list)
    } catch (err) {
      console.warn("Failed fetching admin bookings:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  // Kalkulasi statistik
  const monthlyRevenue = bookings
    .filter((b) => Number(b.is_confirmed) === 1 || b.booking_status === "COMPLETED")
    .reduce((sum, b) => sum + Number(b.total_amount || 0), 0)

  const todayBookings = bookings.filter((b) => b.booking_date?.startsWith(todayStr))
  const todayRevenue = todayBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0)

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      {/* Welcome Banner */}
      <GradientCard className="p-5 mb-5">
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text className="text-white font-black text-lg">Dashboard Admin</Text>
            <Text className="text-cyan-400 font-semibold text-xs">
              Halo, {user?.name || "Administrator"}
            </Text>
          </View>
          <TouchableOpacity onPress={fetchBookings} className="p-2 rounded-lg bg-slate-800">
            <RefreshCw size={16} color="#22D3EE" />
          </TouchableOpacity>
        </View>
        <Text className="text-slate-400 text-xs">
          Pantau reservasi, verifikasi transaksi pembayaran, dan operasional harian barbershop.
        </Text>
      </GradientCard>

      {/* 4 Summary Cards */}
      <Text className="text-slate-300 font-bold text-sm mb-3">Ringkasan Bulan Ini ({currentMonthStr})</Text>
      <View className="flex-row flex-wrap justify-between gap-y-3 mb-6">
        <View className="w-[48%]">
          <SummaryCard
            title="Omzet Bulan Ini"
            value={formatRupiah(monthlyRevenue)}
            variant="blue"
            icon={<Banknote size={18} color="#22D3EE" />}
          />
        </View>
        <View className="w-[48%]">
          <SummaryCard
            title="Omzet Hari Ini"
            value={formatRupiah(todayRevenue)}
            variant="green"
            icon={<TrendingUp size={18} color="#34D399" />}
          />
        </View>
        <View className="w-[48%]">
          <SummaryCard
            title="Total Booking"
            value={bookings.length}
            variant="yellow"
            icon={<Calendar size={18} color="#FBBF24" />}
          />
        </View>
        <View className="w-[48%]">
          <SummaryCard
            title="Booking Hari Ini"
            value={todayBookings.length}
            variant="red"
            icon={<Clock size={18} color="#FB7185" />}
          />
        </View>
      </View>

      {/* Quick Action Navigation */}
      <Text className="text-slate-300 font-bold text-sm mb-3">Aksi Cepat Admin</Text>
      <View className="gap-2.5 mb-6">
        <TouchableOpacity
          onPress={() => router.push("/(drawer)/service-booking")}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-blue-600/20 border border-cyan-400/40 items-center justify-center mr-3">
              <Scissors size={20} color="#22D3EE" />
            </View>
            <View>
              <Text className="text-white font-bold text-sm">Verifikasi Booking</Text>
              <Text className="text-slate-400 text-[11px]">Konfirmasi, tolak, & reschedule jadwal</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(drawer)/product-orders")}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-400/40 items-center justify-center mr-3">
              <ShoppingBag size={20} color="#A855F7" />
            </View>
            <View>
              <Text className="text-white font-bold text-sm">Pesanan Produk</Text>
              <Text className="text-slate-400 text-[11px]">Cek pembayaran dan kirim pesanan</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(drawer)/payment")}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-400/40 items-center justify-center mr-3">
              <CreditCard size={20} color="#34D399" />
            </View>
            <View>
              <Text className="text-white font-bold text-sm">Kasir & Cetak Struk</Text>
              <Text className="text-slate-400 text-[11px]">Cetak invoice thermal struk pembayaran</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Booking Hari Ini List */}
      <Text className="text-slate-300 font-bold text-sm mb-3">Reservasi Hari Ini</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#22D3EE" className="py-6" />
      ) : todayBookings.length === 0 ? (
        <GlassCard className="p-5 items-center mb-6">
          <Text className="text-slate-400 text-xs text-center">Belum ada booking untuk hari ini.</Text>
        </GlassCard>
      ) : (
        <View className="gap-2.5 mb-8">
          {todayBookings.slice(0, 5).map((b) => (
            <GlassCard key={b.id} className="p-3.5 border-slate-800">
              <View className="flex-row justify-between items-center mb-1.5">
                <Text className="text-cyan-400 font-bold text-xs">{b.booking_code}</Text>
                <StatusBadge status={b.booking_status || "PENDING"} />
              </View>
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-white font-semibold text-xs">{b.customer_name || "-"}</Text>
                  <Text className="text-slate-400 text-[10px]">Capster: {b.barber_name || "-"}</Text>
                </View>
                <Text className="text-cyan-300 font-bold text-xs">{formatRupiah(b.total_amount)}</Text>
              </View>
            </GlassCard>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

