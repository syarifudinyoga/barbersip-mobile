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
  Users,
  Search,
  Check,
  X,
  Eye,
  RefreshCw,
  Coins,
  Calendar,
} from "lucide-react-native"
import { PageHeader } from "../../src/components/layout/PageHeader"
import { GlassCard } from "../../src/components/ui/GlassCard"
import { FloatingInput } from "../../src/components/ui/FloatingInput"
import { CustomModal } from "../../src/components/ui/CustomModal"
import { StatusBadge } from "../../src/components/ui/StatusBadge"
import { apiFetch } from "../../src/api/client"
import { formatRupiah, formatDateTime } from "../../src/lib/format"

interface MemberItem {
  id: string
  name: string
  email: string
  whatsapp?: string
  points?: number
  active_until?: string
  verification_status?: "Verified" | "Not Verified"
  membership_payment_proof_url?: string | null
}

interface RenewalItem {
  id: string
  name?: string
  email?: string
  user_id: string
  fee_amount: number
  submitted_at: string
  payment_proof_url: string
}

export default function MembersScreen() {
  const [tab, setTab] = useState<"members" | "renewals">("members")
  const [members, setMembers] = useState<MemberItem[]>([])
  const [renewals, setRenewals] = useState<RenewalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [proofUrl, setProofUrl] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [resMembers, resRenewals] = await Promise.allSettled([
        apiFetch<any[]>("/api/members"),
        apiFetch<any[]>("/api/members/renewal-requests"),
      ])

      if (resMembers.status === "fulfilled" && Array.isArray(resMembers.value)) {
        setMembers(resMembers.value)
      }
      if (resRenewals.status === "fulfilled" && Array.isArray(resRenewals.value)) {
        setRenewals(resRenewals.value)
      }
    } catch (err) {
      console.warn("Failed fetching members data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleVerifyMember = async (id: string, status: "Verified" | "Not Verified") => {
    try {
      await apiFetch(`/api/members/${id}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ verification_status: status }),
      })
      Alert.alert("Sukses", `Status verifikasi member diubah ke ${status}.`)
      fetchData()
    } catch (err: any) {
      Alert.alert("Gagal", err?.message || "Gagal verifikasi member.")
    }
  }

  const handleActionRenewal = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await apiFetch(`/api/members/renewal-requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      Alert.alert("Sukses", `Renewal ${status === "APPROVED" ? "disetujui" : "ditolak"}.`)
      fetchData()
    } catch (err: any) {
      Alert.alert("Gagal", err?.message || "Gagal memproses renewal.")
    }
  }

  const filteredMembers = members.filter((m) =>
    (m.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.email || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      <PageHeader
        title="Manajemen Member"
        subtitle="Verifikasi keanggotaan baru, cek bukti bayar registrasi & approval renewal"
      />

      {/* Tabs Switcher */}
      <View className="flex-row bg-slate-900/90 p-1 rounded-2xl border border-slate-800 mb-4">
        <TouchableOpacity
          onPress={() => setTab("members")}
          className={`flex-1 py-2 rounded-xl flex-row items-center justify-center ${
            tab === "members" ? "bg-blue-600 border border-cyan-400/50 shadow" : ""
          }`}
        >
          <Users size={14} color={tab === "members" ? "#FFFFFF" : "#94A3B8"} />
          <Text className={`text-xs ml-1.5 font-bold ${tab === "members" ? "text-white" : "text-slate-400"}`}>
            Member ({members.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab("renewals")}
          className={`flex-1 py-2 rounded-xl flex-row items-center justify-center ${
            tab === "renewals" ? "bg-blue-600 border border-cyan-400/50 shadow" : ""
          }`}
        >
          <RefreshCw size={14} color={tab === "renewals" ? "#FFFFFF" : "#94A3B8"} />
          <Text className={`text-xs ml-1.5 font-bold ${tab === "renewals" ? "text-white" : "text-slate-400"}`}>
            Renewal ({renewals.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="mb-4">
        <FloatingInput
          label="Cari member..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#22D3EE" className="py-8" />
      ) : tab === "members" ? (
        filteredMembers.length === 0 ? (
          <GlassCard className="p-6 items-center">
            <Text className="text-slate-400 text-xs">Belum ada member terdaftar.</Text>
          </GlassCard>
        ) : (
          <View className="gap-3 mb-10">
            {filteredMembers.map((m) => (
              <GlassCard key={m.id} className="p-4 border-slate-800">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-white font-bold text-xs">{m.name}</Text>
                  <StatusBadge status={m.verification_status || "Not Verified"} />
                </View>

                <View className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 mb-3 space-y-1">
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-xs">Email</Text>
                    <Text className="text-slate-200 text-xs">{m.email}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-xs">Poin</Text>
                    <Text className="text-amber-400 text-xs font-bold">{m.points ?? 0} Poin</Text>
                  </View>
                  {m.active_until && (
                    <View className="flex-row justify-between">
                      <Text className="text-slate-400 text-xs">Masa Aktif</Text>
                      <Text className="text-cyan-400 text-xs">{m.active_until.split("T")[0]}</Text>
                    </View>
                  )}
                </View>

                <View className="flex-row gap-2">
                  {m.membership_payment_proof_url && (
                    <TouchableOpacity
                      onPress={() => setProofUrl(m.membership_payment_proof_url!)}
                      className="p-2 rounded-xl bg-slate-800 border border-slate-700"
                    >
                      <Eye size={16} color="#22D3EE" />
                    </TouchableOpacity>
                  )}

                  {m.verification_status !== "Verified" ? (
                    <TouchableOpacity
                      onPress={() => handleVerifyMember(m.id, "Verified")}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 border border-emerald-400 flex-row items-center justify-center gap-1"
                    >
                      <Check size={14} color="#FFFFFF" />
                      <Text className="text-white font-bold text-xs">Verifikasi Member</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleVerifyMember(m.id, "Not Verified")}
                      className="flex-1 py-2 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center"
                    >
                      <Text className="text-slate-400 text-xs">Batalkan Verifikasi</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </GlassCard>
            ))}
          </View>
        )
      ) : (
        renewals.length === 0 ? (
          <GlassCard className="p-6 items-center">
            <Text className="text-slate-400 text-xs">Tidak ada pengajuan perpanjangan member.</Text>
          </GlassCard>
        ) : (
          <View className="gap-3 mb-10">
            {renewals.map((r) => (
              <GlassCard key={r.id} className="p-4 border-slate-800">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-white font-bold text-xs">{r.name || r.email || "Member"}</Text>
                  <Text className="text-cyan-400 font-bold text-xs">{formatRupiah(r.fee_amount)}</Text>
                </View>
                <Text className="text-slate-400 text-[10px] mb-3">Diajukan: {formatDateTime(r.submitted_at)}</Text>

                <View className="flex-row gap-2">
                  {r.payment_proof_url && (
                    <TouchableOpacity
                      onPress={() => setProofUrl(r.payment_proof_url)}
                      className="p-2 rounded-xl bg-slate-800 border border-slate-700"
                    >
                      <Eye size={16} color="#22D3EE" />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => handleActionRenewal(r.id, "REJECTED")}
                    className="flex-1 py-2 rounded-xl bg-rose-600/20 border border-rose-500/40 items-center justify-center"
                  >
                    <Text className="text-rose-300 font-bold text-xs">Tolak</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleActionRenewal(r.id, "APPROVED")}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 border border-emerald-400 items-center justify-center"
                  >
                    <Text className="text-white font-bold text-xs">Setujui Renewal</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </View>
        )
      )}

      {/* Modal Preview Bukti Transfer */}
      {proofUrl && (
        <CustomModal visible={Boolean(proofUrl)} onClose={() => setProofUrl(null)} title="Bukti Transfer QRIS">
          <View className="items-center">
            <Image source={{ uri: proofUrl }} className="w-72 h-80 rounded-xl mb-3" resizeMode="contain" />
          </View>
        </CustomModal>
      )}
    </ScrollView>
  )
}

