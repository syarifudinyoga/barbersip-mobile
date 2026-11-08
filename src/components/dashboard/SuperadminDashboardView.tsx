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
  ShieldAlert,
  Users,
  FileSpreadsheet,
  Clock,
  Settings,
  Banknote,
  TrendingUp,
  ChevronRight,
  Scissors,
  Award,
} from "lucide-react-native"
import { GradientCard } from "../ui/GradientCard"
import { GlassCard } from "../ui/GlassCard"
import { SummaryCard } from "../ui/SummaryCard"
import { apiFetch } from "../../api/client"
import { formatRupiah } from "../../lib/format"
import { useAuth } from "../../context/AuthContext"

export function SuperadminDashboardView() {
  const router = useRouter()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCapsters: 0,
    totalMembers: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true)
        // Load data summary
        const users = await apiFetch<any[]>("/api/users")
        const userList = Array.isArray(users) ? users : []
        const capsters = userList.filter((u) => u.role === "capster" || u.role === "barber")
        const members = userList.filter((u) => u.role === "member")

        const bookings = await apiFetch<any[]>("/api/bookings")
        const bookingList = Array.isArray(bookings) ? bookings : []
        const revenue = bookingList
          .filter((b) => b.is_confirmed === 1 || b.booking_status === "COMPLETED")
          .reduce((sum, b) => sum + Number(b.total_amount || 0), 0)

        setStats({
          totalUsers: userList.length,
          totalCapsters: capsters.length,
          totalMembers: members.length,
          totalRevenue: revenue,
        })
      } catch (err) {
        console.warn("Failed fetching superadmin stats:", err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      {/* Superadmin Badge Banner */}
      <GradientCard className="p-5 mb-5">
        <View className="flex-row items-center mb-2">
          <View className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 items-center justify-center mr-2.5">
            <ShieldAlert size={18} color="#FB7185" />
          </View>
          <View>
            <Text className="text-white font-black text-lg">Superadmin Control</Text>
            <Text className="text-rose-400 font-semibold text-xs">Akses Penuh Seluruh Sistem</Text>
          </View>
        </View>
        <Text className="text-slate-400 text-xs leading-relaxed">
          Pusat kontrol audit operasional, laporan keuangan tingkat eksekutif, dan konfigurasi master sistem BarberSip.
        </Text>
      </GradientCard>

      {/* 4 Cards Summary Superadmin */}
      <Text className="text-slate-300 font-bold text-sm mb-3">Statistik Keseluruhan</Text>
      <View className="flex-row flex-wrap justify-between gap-y-3 mb-6">
        <View className="w-[48%]">
          <SummaryCard
            title="Total Omzet"
            value={formatRupiah(stats.totalRevenue)}
            variant="blue"
            icon={<Banknote size={18} color="#22D3EE" />}
          />
        </View>
        <View className="w-[48%]">
          <SummaryCard
            title="Total Member"
            value={stats.totalMembers}
            variant="yellow"
            icon={<Award size={18} color="#FBBF24" />}
          />
        </View>
        <View className="w-[48%]">
          <SummaryCard
            title="Total Capster"
            value={stats.totalCapsters}
            variant="green"
            icon={<Scissors size={18} color="#34D399" />}
          />
        </View>
        <View className="w-[48%]">
          <SummaryCard
            title="Total Pengguna"
            value={stats.totalUsers}
            variant="red"
            icon={<Users size={18} color="#FB7185" />}
          />
        </View>
      </View>

      {/* Superadmin Menu Navigasi */}
      <Text className="text-slate-300 font-bold text-sm mb-3">Menu Khusus Superadmin</Text>
      <View className="gap-2.5 mb-8">
        <TouchableOpacity
          onPress={() => router.push("/(drawer)/superadmin-reports")}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-400/40 items-center justify-center mr-3">
              <FileSpreadsheet size={20} color="#22D3EE" />
            </View>
            <View>
              <Text className="text-white font-bold text-sm">Laporan Lengkap & PDF</Text>
              <Text className="text-slate-400 text-[11px]">Audit omzet, export laporan akuntansi</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(drawer)/dashboard-attendance")}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-400/40 items-center justify-center mr-3">
              <Clock size={20} color="#A855F7" />
            </View>
            <View>
              <Text className="text-white font-bold text-sm">Audit Absensi Capster</Text>
              <Text className="text-slate-400 text-[11px]">Cek foto selfie, radius GPS, & jam kerja</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(drawer)/members")}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-400/40 items-center justify-center mr-3">
              <Users size={20} color="#34D399" />
            </View>
            <View>
              <Text className="text-white font-bold text-sm">Manajemen & Approval Member</Text>
              <Text className="text-slate-400 text-[11px]">Verifikasi pendaftaran & renewal QRIS</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(drawer)/settings")}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-400/40 items-center justify-center mr-3">
              <Settings size={20} color="#FBBF24" />
            </View>
            <View>
              <Text className="text-white font-bold text-sm">Pengaturan Sistem</Text>
              <Text className="text-slate-400 text-[11px]">Jam operasional, koordinat geofence, biaya</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#64748B" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

