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
  Clock,
  User,
  Plus,
  Edit2,
  Calendar,
} from "lucide-react-native"
import { PageHeader } from "../../src/components/layout/PageHeader"
import { GlassCard } from "../../src/components/ui/GlassCard"
import { FloatingInput } from "../../src/components/ui/FloatingInput"
import { CustomModal } from "../../src/components/ui/CustomModal"
import { PrimaryButton } from "../../src/components/ui/PrimaryButton"
import { apiFetch } from "../../src/api/client"

interface CapsterItem {
  id: string
  name: string
  photo_url?: string | null
  available?: boolean
  opening_time?: string
  closing_time?: string
}

export default function ServiceCapsterScreen() {
  const [capsters, setCapsters] = useState<CapsterItem[]>([])
  const [loading, setLoading] = useState(true)

  // Edit schedule modal
  const [selectedCapster, setSelectedCapster] = useState<CapsterItem | null>(null)
  const [openingTime, setOpeningTime] = useState("10:00")
  const [closingTime, setClosingTime] = useState("21:00")
  const [saving, setSaving] = useState(false)

  const fetchCapsters = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<CapsterItem[]>("/api/barbers")
      setCapsters(Array.isArray(res) ? res : [])
    } catch (err) {
      console.warn("Failed fetching capsters:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCapsters()
  }, [])

  const handleOpenEdit = (c: CapsterItem) => {
    setSelectedCapster(c)
    setOpeningTime(c.opening_time || "10:00")
    setClosingTime(c.closing_time || "21:00")
  }

  const handleSaveSchedule = async () => {
    if (!selectedCapster) return
    try {
      setSaving(true)
      await apiFetch(`/api/barbers/${selectedCapster.id}/schedule`, {
        method: "PUT",
        body: JSON.stringify({
          opening_time: openingTime,
          closing_time: closingTime,
        }),
      })
      Alert.alert("Sukses", "Jam kerja capster berhasil diperbarui.")
      setSelectedCapster(null)
      fetchCapsters()
    } catch (err: any) {
      Alert.alert("Gagal", err?.message || "Gagal memperbarui jam kerja.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      <PageHeader
        title="Manajemen Capster"
        subtitle="Atur daftar capster aktif dan jam operasional layanan mingguan"
      />

      {loading ? (
        <ActivityIndicator size="small" color="#22D3EE" className="py-8" />
      ) : capsters.length === 0 ? (
        <GlassCard className="p-6 items-center">
          <Text className="text-slate-400 text-xs">Belum ada capster terdaftar.</Text>
        </GlassCard>
      ) : (
        <View className="gap-3 mb-10">
          {capsters.map((c) => (
            <GlassCard key={c.id} className="p-4 border-slate-800 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border border-slate-700 items-center justify-center mr-3">
                  {c.photo_url ? (
                    <Image source={{ uri: c.photo_url }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <User size={22} color="#94A3B8" />
                  )}
                </View>

                <View className="flex-1">
                  <Text className="text-white font-bold text-xs mb-0.5">{c.name}</Text>
                  <View className="flex-row items-center">
                    <Clock size={12} color="#22D3EE" />
                    <Text className="text-slate-400 text-[10px] ml-1">
                      {c.opening_time || "10:00"} - {c.closing_time || "21:00"} WIB
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleOpenEdit(c)}
                className="p-2 rounded-lg bg-slate-800 border border-slate-700"
              >
                <Edit2 size={14} color="#38BDF8" />
              </TouchableOpacity>
            </GlassCard>
          ))}
        </View>
      )}

      {/* Modal Edit Jam Kerja */}
      {selectedCapster && (
        <CustomModal
          visible={Boolean(selectedCapster)}
          onClose={() => setSelectedCapster(null)}
          title="Atur Jam Operasional"
        >
          <View>
            <Text className="text-slate-300 text-xs mb-3">
              Capster: <Text className="text-cyan-400 font-bold">{selectedCapster.name}</Text>
            </Text>
            <FloatingInput
              label="Jam Mulai (HH:MM)"
              value={openingTime}
              onChangeText={setOpeningTime}
              className="mb-2.5"
            />
            <FloatingInput
              label="Jam Selesai (HH:MM)"
              value={closingTime}
              onChangeText={setClosingTime}
              className="mb-4"
            />
            <PrimaryButton
              title="Simpan Jam Kerja"
              onPress={handleSaveSchedule}
              loading={saving}
            />
          </View>
        </CustomModal>
      )}
    </ScrollView>
  )
}

