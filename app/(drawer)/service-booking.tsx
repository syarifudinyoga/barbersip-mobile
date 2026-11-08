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
import {
  Scissors,
  Search,
  Check,
  X,
  Calendar,
  Clock,
  Eye,
  RefreshCw,
  Edit3,
} from "lucide-react-native"
import { PageHeader } from "../../src/components/layout/PageHeader"
import { GlassCard } from "../../src/components/ui/GlassCard"
import { PrimaryButton } from "../../src/components/ui/PrimaryButton"
import { FloatingInput } from "../../src/components/ui/FloatingInput"
import { StatusBadge } from "../../src/components/ui/StatusBadge"
import { CustomModal } from "../../src/components/ui/CustomModal"
import { apiFetch } from "../../src/api/client"
import { formatRupiah, formatDateTime } from "../../src/lib/format"
import { subscribeToBarbersipSocket } from "../../src/lib/socket-client"

interface BookingItem {
  id: string
  booking_code: string
  customer_name: string
  customer_whatsapp?: string
  barber_name?: string
  booking_date: string
  booking_time: string
  total_amount: number
  is_confirmed: number
  booking_status?: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  payment_method?: string
  payment_proof_url?: string | null
  services?: { id: string; name: string; price: number }[]
}

type FilterStatus = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"

export default function ServiceBookingScreen() {
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL")

  // Modals
  const [proofUrl, setProofUrl] = useState<string | null>(null)
  const [rescheduleItem, setRescheduleItem] = useState<BookingItem | null>(null)
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")
  const [savingReschedule, setSavingReschedule] = useState(false)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<any[]>("/api/bookings")
      setBookings(Array.isArray(res) ? res : [])
    } catch (err) {
      console.warn("Failed fetching bookings:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()

    const unsubscribe = subscribeToBarbersipSocket((event) => {
      if (
        event.type === "booking_created" ||
        event.type === "booking_updated" ||
        event.type === "booking_status_updated"
      ) {
        fetchBookings()
      }
    })

    return () => unsubscribe()
  }, [])

  const handleConfirm = async (id: string) => {
    try {
      await apiFetch(`/api/bookings/${id}/confirm`, { method: "PATCH" })
      Alert.alert("Sukses", "Booking berhasil dikonfirmasi.")
      fetchBookings()
    } catch (err: any) {
      Alert.alert("Gagal", err?.message || "Gagal konfirmasi booking.")
    }
  }

  const handleCancel = async (id: string) => {
    Alert.alert("Konfirmasi", "Apakah kamu yakin ingin membatalkan booking ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Ya, Batalkan",
        style: "destructive",
        onPress: async () => {
          try {
            await apiFetch(`/api/bookings/${id}/status`, {
              method: "PATCH",
              body: JSON.stringify({ status: "CANCELLED" }),
            })
            Alert.alert("Sukses", "Booking dibatalkan.")
            fetchBookings()
          } catch (err: any) {
            Alert.alert("Gagal", err?.message || "Gagal membatalkan booking.")
          }
        },
      },
    ])
  }

  const handleSaveReschedule = async () => {
    if (!rescheduleItem || !newDate || !newTime) {
      Alert.alert("Perhatian", "Pilih tanggal dan jam baru.")
      return
    }

    try {
      setSavingReschedule(true)
      await apiFetch(`/api/bookings/${rescheduleItem.id}/reschedule`, {
        method: "PATCH",
        body: JSON.stringify({
          booking_date: newDate,
          booking_time: newTime,
        }),
      })
      Alert.alert("Sukses", "Jadwal booking berhasil diubah.")
      setRescheduleItem(null)
      fetchBookings()
    } catch (err: any) {
      Alert.alert("Gagal", err?.message || "Gagal mengubah jadwal booking.")
    } finally {
      setSavingReschedule(false)
    }
  }

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      (b.booking_code || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.barber_name || "").toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    const st = (b.booking_status || (Number(b.is_confirmed) === 1 ? "CONFIRMED" : "PENDING")).toUpperCase()
    if (statusFilter === "ALL") return true
    return st === statusFilter
  })

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      <PageHeader
        title="Verifikasi Booking"
        subtitle="Kelola konfirmasi reservasi, reschedule, dan cek bukti bayar transfer"
      />

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-3">
        {(["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as FilterStatus[]).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-xl border ${
              statusFilter === f
                ? "bg-blue-600 border-cyan-400"
                : "bg-slate-900 border-slate-800"
            }`}
          >
            <Text className={`text-xs font-bold ${statusFilter === f ? "text-white" : "text-slate-400"}`}>
              {f === "ALL" ? "Semua" : f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search Input */}
      <View className="mb-4">
        <FloatingInput
          label="Cari kode booking / nama..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List Booking */}
      {loading ? (
        <ActivityIndicator size="small" color="#22D3EE" className="py-8" />
      ) : filtered.length === 0 ? (
        <GlassCard className="p-6 items-center">
          <Text className="text-slate-400 text-xs">Tidak ada data booking yang sesuai.</Text>
        </GlassCard>
      ) : (
        <View className="gap-3 mb-10">
          {filtered.map((b) => {
            const st = (b.booking_status || (Number(b.is_confirmed) === 1 ? "CONFIRMED" : "PENDING")).toUpperCase()
            return (
              <GlassCard key={b.id} className="p-4 border-slate-800">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-cyan-400 font-black text-xs">{b.booking_code}</Text>
                  <StatusBadge status={st} />
                </View>

                <View className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 mb-3 space-y-1">
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-xs">Pelanggan</Text>
                    <Text className="text-slate-200 text-xs font-semibold">{b.customer_name}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-xs">Capster</Text>
                    <Text className="text-slate-200 text-xs font-semibold">{b.barber_name || "-"}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-xs">Jadwal</Text>
                    <Text className="text-cyan-300 text-xs font-bold">{b.booking_date} @ {b.booking_time}</Text>
                  </View>
                  <View className="flex-row justify-between pt-1 border-t border-slate-800">
                    <Text className="text-slate-400 text-xs">Total Biaya</Text>
                    <Text className="text-emerald-400 text-xs font-bold">{formatRupiah(b.total_amount)}</Text>
                  </View>
                </View>

                {/* Actions Bar */}
                <View className="flex-row items-center gap-2">
                  {b.payment_proof_url && (
                    <TouchableOpacity
                      onPress={() => setProofUrl(b.payment_proof_url!)}
                      className="p-2 rounded-xl bg-slate-800 border border-slate-700"
                    >
                      <Eye size={16} color="#22D3EE" />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => {
                      setRescheduleItem(b)
                      setNewDate(b.booking_date)
                      setNewTime(b.booking_time)
                    }}
                    className="p-2 rounded-xl bg-slate-800 border border-slate-700"
                  >
                    <Edit3 size={16} color="#FBBF24" />
                  </TouchableOpacity>

                  {st === "PENDING" && (
                    <>
                      <TouchableOpacity
                        onPress={() => handleCancel(b.id)}
                        className="py-2 px-3 rounded-xl bg-rose-600/20 border border-rose-500/40"
                      >
                        <X size={16} color="#FB7185" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleConfirm(b.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 border border-emerald-400 flex-row items-center justify-center gap-1"
                      >
                        <Check size={14} color="#FFFFFF" />
                        <Text className="text-white font-bold text-xs">Konfirmasi</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </GlassCard>
            )
          })}
        </View>
      )}

      {/* Modal Preview Bukti Transfer */}
      {proofUrl && (
        <CustomModal visible={Boolean(proofUrl)} onClose={() => setProofUrl(null)} title="Bukti Transfer QRIS">
          <View className="items-center">
            <Image source={{ uri: proofUrl }} className="w-72 h-80 rounded-xl mb-3" resizeMode="contain" />
          </View>
        </CustomModal>
      )}

      {/* Modal Reschedule */}
      {rescheduleItem && (
        <CustomModal visible={Boolean(rescheduleItem)} onClose={() => setRescheduleItem(null)} title="Reschedule Jadwal">
          <View>
            <Text className="text-slate-300 text-xs mb-3">
              Ubah jadwal booking untuk <Text className="text-cyan-400 font-bold">{rescheduleItem.booking_code}</Text>
            </Text>
            <FloatingInput
              label="Tanggal Baru (YYYY-MM-DD)"
              value={newDate}
              onChangeText={setNewDate}
              className="mb-2.5"
            />
            <FloatingInput
              label="Jam Baru (HH:MM)"
              value={newTime}
              onChangeText={setNewTime}
              className="mb-4"
            />
            <PrimaryButton
              title="Simpan Jadwal Baru"
              onPress={handleSaveReschedule}
              loading={savingReschedule}
            />
          </View>
        </CustomModal>
      )}
    </ScrollView>
  )
}

