import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import {
  Scissors,
  Camera,
  Play,
  Check,
  X,
  Clock,
  Calendar,
  MapPin,
  RefreshCw,
  Phone,
  User,
} from "lucide-react-native"
import { GradientCard } from "../ui/GradientCard"
import { GlassCard } from "../ui/GlassCard"
import { SummaryCard } from "../ui/SummaryCard"
import { PrimaryButton } from "../ui/PrimaryButton"
import { StatusBadge } from "../ui/StatusBadge"
import { useAuth } from "../../context/AuthContext"
import { apiFetch, uploadFile } from "../../api/client"
import { formatRupiah, formatDateTime } from "../../lib/format"
import { subscribeToBarbersipSocket } from "../../lib/socket-client"

interface TodayBooking {
  id: string
  booking_code: string
  customer_name: string
  customer_whatsapp?: string
  booking_date: string
  booking_time: string
  total_amount: number
  booking_status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  services?: { id: string; name: string }[]
}

export function CapsterDashboardView() {
  const router = useRouter()
  const { user } = useAuth()
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [bookings, setBookings] = useState<TodayBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const todayStr = new Date().toISOString().split("T")[0]

  const fetchTodayBookings = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<any>(`/api/bookings?date=${todayStr}`)
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
      // Filter booking capster jika ada filter
      setBookings(list)
    } catch (err) {
      console.warn("Failed fetching capster bookings:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodayBookings()

    // Realtime websocket listener
    const unsubscribe = subscribeToBarbersipSocket((event) => {
      if (
        event.type === "booking_created" ||
        event.type === "booking_updated" ||
        event.type === "booking_status_updated"
      ) {
        fetchTodayBookings()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleUpdateStatus = async (
    bookingId: string,
    nextStatus: "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  ) => {
    try {
      setUpdatingId(bookingId)
      await apiFetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      })
      Alert.alert("Sukses", `Status booking berhasil diperbarui ke ${nextStatus}.`)
      fetchTodayBookings()
    } catch (err: any) {
      Alert.alert("Gagal", err?.message || "Gagal memperbarui status booking.")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleChangePhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!res.canceled && res.assets[0]?.uri) {
      try {
        const uploadRes = await uploadFile(res.assets[0].uri)
        await apiFetch("/api/users/me/photo", {
          method: "POST",
          body: JSON.stringify({ photo_url: uploadRes.url }),
        })
        setProfilePhoto(uploadRes.url)
        Alert.alert("Sukses", "Foto profil capster berhasil diperbarui.")
      } catch (err: any) {
        Alert.alert("Gagal", err?.message || "Gagal memperbarui foto.")
      }
    }
  }

  const completedCount = bookings.filter((b) => b.booking_status === "COMPLETED").length
  const pendingCount = bookings.filter((b) => b.booking_status === "PENDING" || b.booking_status === "CONFIRMED").length

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      {/* Capster Profile Card */}
      <GradientCard className="p-5 mb-5">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1 mr-2">
            <View className="relative">
              <View className="w-14 h-14 rounded-full overflow-hidden bg-slate-800 border-2 border-cyan-400 items-center justify-center">
                {profilePhoto ? (
                  <Image source={{ uri: profilePhoto }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <User size={28} color="#94A3B8" />
                )}
              </View>
              <TouchableOpacity
                onPress={handleChangePhoto}
                className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-600 border border-cyan-400 items-center justify-center"
              >
                <Camera size={10} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-white font-extrabold text-base">{user?.name}</Text>
              <Text className="text-cyan-300 font-bold text-xs uppercase tracking-wider">
                Capster Profesional
              </Text>
              <Text className="text-slate-400 text-[10px]">{user?.email}</Text>
            </View>
          </View>

          {/* Quick Button Absensi */}
          <TouchableOpacity
            onPress={() => router.push("/(drawer)/attendance")}
            className="px-3 py-2 rounded-xl bg-blue-600/40 border border-cyan-400 items-center justify-center shadow-lg shadow-cyan-500/20"
          >
            <MapPin size={16} color="#22D3EE" />
            <Text className="text-cyan-200 text-[10px] font-bold mt-0.5">Absensi</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-2 pt-3 border-t border-slate-800">
          <View className="flex-1 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 items-center">
            <Text className="text-slate-400 text-[10px]">Selesai Hari Ini</Text>
            <Text className="text-emerald-400 font-extrabold text-base">{completedCount}</Text>
          </View>
          <View className="flex-1 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 items-center">
            <Text className="text-slate-400 text-[10px]">Antrean Aktif</Text>
            <Text className="text-cyan-400 font-extrabold text-base">{pendingCount}</Text>
          </View>
        </View>
      </GradientCard>

      {/* TODAY QUEUE LIST */}
      <View className="flex-row items-center justify-between mb-3 px-1">
        <View className="flex-row items-center">
          <Clock size={18} color="#22D3EE" />
          <Text className="text-white font-bold text-sm ml-2">Antrean Hari Ini ({todayStr})</Text>
        </View>
        <TouchableOpacity onPress={fetchTodayBookings} className="p-1">
          <RefreshCw size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#22D3EE" className="py-8" />
      ) : bookings.length === 0 ? (
        <GlassCard className="p-6 items-center">
          <Scissors size={32} color="#475569" className="mb-2" />
          <Text className="text-slate-400 text-xs text-center">
            Belum ada antrean booking untuk hari ini.
          </Text>
        </GlassCard>
      ) : (
        <View className="space-y-3 mb-8">
          {bookings.map((item) => {
            const isUpdating = updatingId === item.id
            return (
              <GlassCard key={item.id} className="p-4 mb-3 border-slate-800">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-cyan-400 font-black text-sm">{item.booking_code}</Text>
                  <StatusBadge status={item.booking_status} />
                </View>

                <View className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 mb-3 space-y-1.5">
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-xs">Pelanggan</Text>
                    <Text className="text-slate-200 text-xs font-semibold">{item.customer_name}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-xs">Jam Slot</Text>
                    <Text className="text-cyan-300 text-xs font-bold">{item.booking_time}</Text>
                  </View>
                  {item.services && item.services.length > 0 && (
                    <View className="flex-row justify-between">
                      <Text className="text-slate-400 text-xs">Layanan</Text>
                      <Text className="text-slate-200 text-xs font-medium" numberOfLines={1}>
                        {item.services.map((s) => s.name).join(", ")}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Tombol Aksi Capster */}
                {item.booking_status === "CONFIRMED" && (
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleUpdateStatus(item.id, "IN_PROGRESS")}
                      disabled={isUpdating}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600 border border-cyan-400 flex-row items-center justify-center gap-1.5"
                    >
                      <Play size={14} color="#FFFFFF" />
                      <Text className="text-white font-bold text-xs">Mulai Potong</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {item.booking_status === "IN_PROGRESS" && (
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleUpdateStatus(item.id, "COMPLETED")}
                      disabled={isUpdating}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 border border-emerald-400 flex-row items-center justify-center gap-1.5"
                    >
                      <Check size={14} color="#FFFFFF" />
                      <Text className="text-white font-bold text-xs">Selesai Treatment</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </GlassCard>
            )
          })}
        </View>
      )}
    </ScrollView>
  )
}

