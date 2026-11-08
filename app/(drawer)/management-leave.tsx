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
  CalendarOff,
  Plus,
  Check,
  X,
  Clock,
  User,
} from "lucide-react-native"
import { PageHeader } from "../../src/components/layout/PageHeader"
import { GlassCard } from "../../src/components/ui/GlassCard"
import { FloatingInput } from "../../src/components/ui/FloatingInput"
import { CustomModal } from "../../src/components/ui/CustomModal"
import { PrimaryButton } from "../../src/components/ui/PrimaryButton"
import { StatusBadge } from "../../src/components/ui/StatusBadge"
import { useAuth } from "../../src/context/AuthContext"
import { apiFetch } from "../../src/api/client"

interface LeaveItem {
  id: string
  barber_name?: string
  start_date: string
  end_date: string
  reason?: string
  status: "PENDING" | "APPROVED" | "REJECTED"
}

export default function ManagementLeaveScreen() {
  const { user } = useAuth()
  const isAdminOrSuper = user?.role === "admin" || user?.role === "superadmin"

  const [leaves, setLeaves] = useState<LeaveItem[]>([])
  const [loading, setLoading] = useState(true)

  // Modal Ajukan Cuti (untuk Capster)
  const [modalOpen, setModalOpen] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchLeaves = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<LeaveItem[]>("/api/leaves")
      setLeaves(Array.isArray(res) ? res : [])
    } catch (err) {
      console.warn("Failed fetching leaves:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaves()
  }, [])

  const handleApplyLeave = async () => {
    if (!startDate || !endDate) {
      Alert.alert("Perhatian", "Tanggal mulai dan selesai cuti wajib diisi.")
      return
    }

    try {
      setSaving(true)
      await apiFetch("/api/leaves", {
        method: "POST",
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          reason,
        }),
      })
      Alert.alert("Sukses", "Pengajuan cuti berhasil dikirim.")
      setModalOpen(false)
      setStartDate("")
      setEndDate("")
      setReason("")
      fetchLeaves()
    } catch (err: any) {
      Alert.alert("Gagal", err?.message || "Gagal mengajukan cuti.")
    } finally {
      setSaving(false)
    }
  }

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await apiFetch(`/api/leaves/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      Alert.alert("Sukses", `Pengajuan cuti ${status === "APPROVED" ? "disetujui" : "ditolak"}.`)
      fetchLeaves()
    } catch (err: any) {
      Alert.alert("Gagal", err?.message || "Gagal memproses cuti.")
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      <PageHeader
        title="Manajemen Cuti Capster"
        subtitle="Pengajuan izin libur kerja capster dan persetujuan dari pihak manajemen"
      />

      <TouchableOpacity
        onPress={() => setModalOpen(true)}
        className="w-full py-3 rounded-2xl bg-blue-600 border border-cyan-400 flex-row items-center justify-center gap-2 mb-4 shadow-lg shadow-cyan-500/20"
      >
        <Plus size={18} color="#FFFFFF" />
        <Text className="text-white font-bold text-xs">Ajukan Izin Cuti</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="small" color="#22D3EE" className="py-8" />
      ) : leaves.length === 0 ? (
        <GlassCard className="p-6 items-center">
          <Text className="text-slate-400 text-xs">Belum ada pengajuan cuti.</Text>
        </GlassCard>
      ) : (
        <View className="gap-3 mb-10">
          {leaves.map((l) => (
            <GlassCard key={l.id} className="p-4 border-slate-800">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white font-bold text-xs">{l.barber_name || user?.name}</Text>
                <StatusBadge status={l.status} />
              </View>

              <View className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 mb-3 space-y-1">
                <View className="flex-row justify-between">
                  <Text className="text-slate-400 text-xs">Periode Cuti</Text>
                  <Text className="text-cyan-300 text-xs font-semibold">{l.start_date} s/d {l.end_date}</Text>
                </View>
                {l.reason && (
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-xs">Alasan</Text>
                    <Text className="text-slate-200 text-xs">{l.reason}</Text>
                  </View>
                )}
              </View>

              {isAdminOrSuper && l.status === "PENDING" && (
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleAction(l.id, "REJECTED")}
                    className="flex-1 py-2 rounded-xl bg-rose-600/20 border border-rose-500/40 flex-row items-center justify-center gap-1"
                  >
                    <X size={14} color="#FB7185" />
                    <Text className="text-rose-300 font-bold text-xs">Tolak</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleAction(l.id, "APPROVED")}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 border border-emerald-400 flex-row items-center justify-center gap-1"
                  >
                    <Check size={14} color="#FFFFFF" />
                    <Text className="text-white font-bold text-xs">Setujui</Text>
                  </TouchableOpacity>
                </View>
              )}
            </GlassCard>
          ))}
        </View>
      )}

      {/* Modal Ajukan Cuti */}
      <CustomModal visible={modalOpen} onClose={() => setModalOpen(false)} title="Ajukan Cuti">
        <View>
          <FloatingInput label="Tanggal Mulai (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} className="mb-2.5" />
          <FloatingInput label="Tanggal Selesai (YYYY-MM-DD)" value={endDate} onChangeText={setEndDate} className="mb-2.5" />
          <FloatingInput label="Alasan Cuti" value={reason} onChangeText={setReason} multiline numberOfLines={2} className="mb-4" />
          <PrimaryButton title="Kirim Pengajuan" onPress={handleApplyLeave} loading={saving} />
        </View>
      </CustomModal>
    </ScrollView>
  )
}

