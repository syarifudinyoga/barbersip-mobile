import React, { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native"
import {
  Search,
  Calendar,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
} from "lucide-react-native"
import { GradientCard } from "../ui/GradientCard"
import { FloatingInput } from "../ui/FloatingInput"
import { PrimaryButton } from "../ui/PrimaryButton"
import { StatusBadge } from "../ui/StatusBadge"
import { apiFetch } from "../../api/client"
import { formatRupiah, formatDateTime } from "../../lib/format"
import { useAppSettings } from "../../hooks/useAppSettings"

interface BookingDetail {
  booking_code?: string
  bookingCode?: string
  customer_name?: string
  customerName?: string
  customer_whatsapp?: string
  customerWhatsapp?: string
  barber_name?: string
  barberName?: string
  booking_date?: string
  bookingDate?: string
  booking_time?: string
  bookingTime?: string
  booking_status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  bookingStatus?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  payment_status?: string
  paymentStatus?: string
  total_amount?: number
  totalAmount?: number
  services?: {
    id: string | number
    name: string
    price: number
    duration?: number
  }[]
}

export function BookingTrackerSection() {
  const { settings } = useAppSettings()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [error, setError] = useState("")

  const handleTrack = async () => {
    const trimmed = code.trim()
    if (!trimmed) {
      setError("Masukkan kode booking kamu.")
      return
    }

    try {
      setLoading(true)
      setError("")
      setBooking(null)

      const res = await apiFetch<any>(`/api/bookings/${encodeURIComponent(trimmed)}`)
      // API bisa me-return array atau single object
      if (Array.isArray(res)) {
        if (res.length === 0) {
          setError("Booking tidak ditemukan. Periksa kembali kode booking kamu.")
        } else {
          setBooking(res[0])
        }
      } else if (res && (res.booking_code || res.bookingCode || res.id)) {
        setBooking(res)
      } else {
        setError("Booking tidak ditemukan.")
      }
    } catch (err: any) {
      setError(err?.message || "Booking tidak ditemukan. Pastikan kodenya benar.")
    } finally {
      setLoading(false)
    }
  }

  const status = (booking?.booking_status || booking?.bookingStatus || "PENDING").toUpperCase()
  const bCode = booking?.booking_code || booking?.bookingCode || code
  const cName = booking?.customer_name || booking?.customerName || "-"
  const bName = booking?.barber_name || booking?.barberName || "-"
  const bDate = booking?.booking_date || booking?.bookingDate || "-"
  const bTime = booking?.booking_time || booking?.bookingTime || "-"
  const amount = Number(booking?.total_amount || booking?.totalAmount || 0)

  return (
    <View className="mb-8">
      <GradientCard className="p-5">
        <View className="flex-row items-center mb-3">
          <Search size={20} color="#22D3EE" />
          <Text className="text-white font-bold text-base ml-2">Lacak Status Booking</Text>
        </View>
        <Text className="text-slate-400 text-xs mb-4">
          Masukkan kode booking untuk mengecek konfirmasi dan antreanmu.
        </Text>

        <View className="flex-row gap-2 mb-3">
          <View className="flex-1">
            <FloatingInput
              label="Kode Booking (cth: BS-12345)"
              value={code}
              onChangeText={(text) => {
                setCode(text)
                setError("")
              }}
              autoCapitalize="characters"
            />
          </View>
          <PrimaryButton
            title="Lacak"
            onPress={handleTrack}
            loading={loading}
            className="px-5 self-end mb-1"
          />
        </View>

        {error ? (
          <View className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl flex-row items-center mt-2">
            <AlertCircle size={16} color="#FB7185" />
            <Text className="text-rose-300 text-xs ml-2 flex-1">{error}</Text>
          </View>
        ) : null}

        {/* Hasil Lacak */}
        {booking && (
          <View className="mt-4 pt-4 border-t border-slate-800">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-cyan-400 font-extrabold text-sm">{bCode}</Text>
              <StatusBadge status={status} />
            </View>

            <View className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2 mb-3">
              <View className="flex-row justify-between py-1">
                <Text className="text-slate-400 text-xs">Pemesan</Text>
                <Text className="text-slate-200 text-xs font-semibold">{cName}</Text>
              </View>
              <View className="flex-row justify-between py-1">
                <Text className="text-slate-400 text-xs">Capster</Text>
                <Text className="text-slate-200 text-xs font-semibold">{bName}</Text>
              </View>
              <View className="flex-row justify-between py-1">
                <Text className="text-slate-400 text-xs">Jadwal</Text>
                <Text className="text-slate-200 text-xs font-semibold">
                  {bDate} @ {bTime}
                </Text>
              </View>
              <View className="flex-row justify-between py-1 border-t border-slate-800/80 mt-1 pt-2">
                <Text className="text-slate-400 text-xs font-semibold">Total Biaya</Text>
                <Text className="text-cyan-400 text-xs font-bold">{formatRupiah(amount)}</Text>
              </View>
            </View>

            {/* WA Help Button */}
            {settings?.call_center_whatsapp && (
              <TouchableOpacity
                onPress={() => Linking.openURL(`https://wa.me/${settings.call_center_whatsapp}?text=Halo%20BarberSip,%20saya%20ingin%20tanya%20booking%20${bCode}`)}
                className="py-2.5 px-3 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex-row items-center justify-center gap-2"
              >
                <MessageCircle size={16} color="#34D399" />
                <Text className="text-emerald-300 text-xs font-semibold">
                  Hubungi Admin via WhatsApp
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </GradientCard>
    </View>
  )
}

