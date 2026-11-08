import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native"
import {
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  Clock,
} from "lucide-react-native"
import { PageHeader } from "../../src/components/layout/PageHeader"
import { GlassCard } from "../../src/components/ui/GlassCard"
import { FloatingInput } from "../../src/components/ui/FloatingInput"
import { CustomModal } from "../../src/components/ui/CustomModal"
import { PrimaryButton } from "../../src/components/ui/PrimaryButton"
import { StatusBadge } from "../../src/components/ui/StatusBadge"
import { apiFetch } from "../../src/api/client"
import { formatRupiah } from "../../src/lib/format"

interface PriceEvent {
  id: string
  name: string
  discount_percentage?: number
  fixed_discount?: number
  starts_at?: string
  ends_at?: string
  is_active: boolean
}

export default function ServicePriceEventsScreen() {
  const [events, setEvents] = useState<PriceEvent[]>([])
  const [loading, setLoading] = useState(true)

  // Modal Add
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState("")
  const [discountPercent, setDiscountPercent] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<PriceEvent[]>("/api/service-price-events")
      setEvents(Array.isArray(res) ? res : [])
    } catch (err) {
      console.warn("Failed fetching price events:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleSave = async () => {
    if (!name.trim() || !discountPercent) {
      Alert.alert("Perhatian", "Nama event dan persentase diskon wajib diisi.")
      return
    }

    try {
      setSaving(true)
      await apiFetch("/api/service-price-events", {
        method: "POST",
        body: JSON.stringify({
          name,
          discount_percentage: Number(discountPercent),
          starts_at: startsAt || undefined,
          ends_at: endsAt || undefined,
          is_active: true,
        }),
      })
      Alert.alert("Sukses", "Event promo harga berhasil dibuat.")
      setModalOpen(false)
      setName("")
      setDiscountPercent("")
      fetchEvents()
    } catch (err: any) {
      Alert.alert("Gagal", err?.message || "Gagal membuat event promo.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (id: string) => {
    Alert.alert("Hapus Event", "Apakah kamu yakin ingin menghapus event promo ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await apiFetch(`/api/service-price-events/${id}`, { method: "DELETE" })
            Alert.alert("Sukses", "Event telah dihapus.")
            fetchEvents()
          } catch (err: any) {
            Alert.alert("Gagal", err?.message || "Gagal menghapus event.")
          }
        },
      },
    ])
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      <PageHeader
        title="Event Promo Harga"
        subtitle="Buat penawaran diskon khusus dan flash sale treatment"
      />

      <TouchableOpacity
        onPress={() => setModalOpen(true)}
        className="w-full py-3 rounded-2xl bg-blue-600 border border-cyan-400 flex-row items-center justify-center gap-2 mb-4 shadow-lg shadow-cyan-500/20"
      >
        <Plus size={18} color="#FFFFFF" />
        <Text className="text-white font-bold text-xs">Tambah Event Promo</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="small" color="#22D3EE" className="py-8" />
      ) : events.length === 0 ? (
        <GlassCard className="p-6 items-center">
          <Text className="text-slate-400 text-xs">Belum ada event promo aktif.</Text>
        </GlassCard>
      ) : (
        <View className="gap-3 mb-10">
          {events.map((e) => (
            <GlassCard key={e.id} className="p-4 border-slate-800 flex-row items-center justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-white font-bold text-xs mb-1">{e.name}</Text>
                <View className="flex-row items-center gap-2">
                  <View className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40">
                    <Text className="text-cyan-300 font-extrabold text-[10px]">
                      Diskon {e.discount_percentage ?? 0}%
                    </Text>
                  </View>
                  <StatusBadge status={e.is_active ? "ACTIVE" : "INACTIVE"} />
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleDelete(e.id)}
                className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30"
              >
                <Trash2 size={14} color="#FB7185" />
              </TouchableOpacity>
            </GlassCard>
          ))}
        </View>
      )}

      {/* Modal Buat Event */}
      <CustomModal visible={modalOpen} onClose={() => setModalOpen(false)} title="Buat Event Promo">
        <View>
          <FloatingInput label="Nama Event (cth: Flash Sale Jumat)" value={name} onChangeText={setName} className="mb-2.5" />
          <FloatingInput label="Besar Diskon (%)" value={discountPercent} onChangeText={setDiscountPercent} keyboardType="numeric" className="mb-2.5" />
          <FloatingInput label="Tanggal Mulai (YYYY-MM-DD)" value={startsAt} onChangeText={setStartsAt} className="mb-2.5" />
          <FloatingInput label="Tanggal Selesai (YYYY-MM-DD)" value={endsAt} onChangeText={setEndsAt} className="mb-4" />
          <PrimaryButton title="Simpan Event Promo" onPress={handleSave} loading={saving} />
        </View>
      </CustomModal>
    </ScrollView>
  )
}

