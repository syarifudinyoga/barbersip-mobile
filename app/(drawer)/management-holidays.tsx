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
  Calendar,
  Plus,
  Trash2,
} from "lucide-react-native"
import { PageHeader } from "../../src/components/layout/PageHeader"
import { GlassCard } from "../../src/components/ui/GlassCard"
import { FloatingInput } from "../../src/components/ui/FloatingInput"
import { CustomModal } from "../../src/components/ui/CustomModal"
import { PrimaryButton } from "../../src/components/ui/PrimaryButton"
import { apiFetch } from "../../src/api/client"

interface HolidayItem {
  id: string
  holiday_date: string
  description?: string
}

export default function ManagementHolidaysScreen() {
  const [holidays, setHolidays] = useState<HolidayItem[]>([])
  const [loading, setLoading] = useState(true)

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [date, setDate] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchHolidays = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<HolidayItem[]>("/api/holidays")
      setHolidays(Array.isArray(res) ? res : [])
    } catch (err) {
      console.warn("Failed fetching holidays:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHolidays()
  }, [])

  const handleSave = async () => {
    if (!date.trim()) {
      Alert.alert("Perhatian", "Tanggal libur wajib diisi.")
      return
    }

    try {
      setSaving(true)
      await apiFetch("/api/holidays", {
        method: "POST",
        body: JSON.stringify({
          holiday_date: date,
          description: description || "Libur Operasional",
        }),
      })
      Alert.alert("Sukses", "Hari libur berhasil dicatat.")
      setModalOpen(false)
      setDate("")
      setDescription("")
      fetchHolidays()
    } catch (err: any) {
      Alert.alert("Gagal", err?.message || "Gagal mencatat hari libur.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (id: string) => {
    Alert.alert("Hapus Hari Libur", "Apakah kamu yakin ingin menghapus data ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await apiFetch(`/api/holidays/${id}`, { method: "DELETE" })
            Alert.alert("Sukses", "Hari libur dihapus.")
            fetchHolidays()
          } catch (err: any) {
            Alert.alert("Gagal", err?.message || "Gagal menghapus.")
          }
        },
      },
    ])
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      <PageHeader
        title="Hari Libur & Cuti"
        subtitle="Atur hari libur operasional outlet agar sistem memblokir booking pada tanggal tersebut"
      />

      <TouchableOpacity
        onPress={() => setModalOpen(true)}
        className="w-full py-3 rounded-2xl bg-blue-600 border border-cyan-400 flex-row items-center justify-center gap-2 mb-4 shadow-lg shadow-cyan-500/20"
      >
        <Plus size={18} color="#FFFFFF" />
        <Text className="text-white font-bold text-xs">Tambah Hari Libur</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="small" color="#22D3EE" className="py-8" />
      ) : holidays.length === 0 ? (
        <GlassCard className="p-6 items-center">
          <Text className="text-slate-400 text-xs">Belum ada hari libur terjadwal.</Text>
        </GlassCard>
      ) : (
        <View className="gap-3 mb-10">
          {holidays.map((h) => (
            <GlassCard key={h.id} className="p-4 border-slate-800 flex-row items-center justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-white font-bold text-xs mb-0.5">{h.holiday_date}</Text>
                <Text className="text-slate-400 text-[11px]">{h.description || "Toko Libur"}</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleDelete(h.id)}
                className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30"
              >
                <Trash2 size={14} color="#FB7185" />
              </TouchableOpacity>
            </GlassCard>
          ))}
        </View>
      )}

      {/* Modal Tambah */}
      <CustomModal visible={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Hari Libur">
        <View>
          <FloatingInput label="Tanggal Libur (YYYY-MM-DD)" value={date} onChangeText={setDate} className="mb-2.5" />
          <FloatingInput label="Keterangan (cth: Libur Hari Raya)" value={description} onChangeText={setDescription} className="mb-4" />
          <PrimaryButton title="Simpan Hari Libur" onPress={handleSave} loading={saving} />
        </View>
      </CustomModal>
    </ScrollView>
  )
}

