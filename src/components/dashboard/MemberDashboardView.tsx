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
import {
  User,
  Camera,
  KeyRound,
  CreditCard,
  Gift,
  Calendar,
  Clock,
  Sparkles,
  RefreshCw,
  Coins,
  CheckCircle,
  AlertCircle,
  Upload,
} from "lucide-react-native"
import { GradientCard } from "../ui/GradientCard"
import { GlassCard } from "../ui/GlassCard"
import { SummaryCard } from "../ui/SummaryCard"
import { PrimaryButton } from "../ui/PrimaryButton"
import { FloatingInput } from "../ui/FloatingInput"
import { CustomModal } from "../ui/CustomModal"
import { StatusBadge } from "../ui/StatusBadge"
import { useAuth } from "../../context/AuthContext"
import { useAppSettings } from "../../hooks/useAppSettings"
import { apiFetch, uploadFile } from "../../api/client"
import { formatRupiah, formatDateTime } from "../../lib/format"

interface MemberProfile {
  id?: string
  name?: string
  email?: string
  whatsapp?: string
  profile_image_url?: string | null
  active_until?: string
  total_spent?: number
  total_bookings?: number
  confirm_bookings?: number
  pending_bookings?: number
  total_point_cashback_earned?: number
  points?: number
}

interface PointHistoryItem {
  id: string
  point_change: number | string
  tanggal: string
  activity: string
  booking_code?: string | null
}

export function MemberDashboardView() {
  const { user } = useAuth()
  const { settings } = useAppSettings()

  const [member, setMember] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Point History Modal
  const [pointModalOpen, setPointModalOpen] = useState(false)
  const [pointHistory, setPointHistory] = useState<PointHistoryItem[]>([])
  const [loadingPoints, setLoadingPoints] = useState(false)

  // Password Modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)

  // Renewal Modal
  const [renewalModalOpen, setRenewalModalOpen] = useState(false)
  const [renewalProofUri, setRenewalProofUri] = useState<string | null>(null)
  const [submittingRenewal, setSubmittingRenewal] = useState(false)

  // Load Member Detail
  const fetchMember = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const data = await apiFetch<any>(`/api/users?uid=${encodeURIComponent(user.id)}`)
      setMember(Array.isArray(data) ? data[0] : data)
    } catch (err) {
      console.warn("Failed fetching member details:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMember()
  }, [user?.id])

  // Profile Photo Upload
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
        Alert.alert("Sukses", "Foto profil berhasil diperbarui.")
        fetchMember()
      } catch (err: any) {
        Alert.alert("Gagal", err?.message || "Gagal mengunggah foto profil.")
      }
    }
  }

  // Load Point History
  const openPoints = async () => {
    setPointModalOpen(true)
    try {
      setLoadingPoints(true)
      const res = await apiFetch<PointHistoryItem[]>("/api/users/points/history")
      setPointHistory(Array.isArray(res) ? res : [])
    } catch (err) {
      console.warn("Failed point history:", err)
    } finally {
      setLoadingPoints(false)
    }
  }

  // Change Password
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert("Perhatian", "Semua kolom kata sandi harus diisi.")
      return
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Perhatian", "Konfirmasi kata sandi baru tidak cocok.")
      return
    }
    if (newPassword.length < 6) {
      Alert.alert("Perhatian", "Kata sandi baru minimal 6 karakter.")
      return
    }

    try {
      setSavingPassword(true)
      await apiFetch("/api/users/me/password", {
        method: "PUT",
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      })
      Alert.alert("Sukses", "Kata sandi berhasil diubah.")
      setPasswordModalOpen(false)
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      Alert.alert("Gagal", err?.message || "Kata sandi lama tidak sesuai.")
    } finally {
      setSavingPassword(false)
    }
  }

  // Submit Renewal
  const handleRenewal = async () => {
    if (!renewalProofUri) {
      Alert.alert("Perhatian", "Silakan unggah bukti transfer perpanjangan.")
      return
    }

    try {
      setSubmittingRenewal(true)
      const uploadRes = await uploadFile(renewalProofUri)
      await apiFetch("/api/members/renewal-requests", {
        method: "POST",
        body: JSON.stringify({ payment_proof_url: uploadRes.url }),
      })
      Alert.alert("Sukses", "Pengajuan perpanjangan member berhasil dikirim.")
      setRenewalModalOpen(false)
      setRenewalProofUri(null)
    } catch (err: any) {
      Alert.alert("Gagal", err?.message || "Pengajuan gagal dikirim.")
    } finally {
      setSubmittingRenewal(false)
    }
  }

  const pickRenewalProof = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    })
    if (!res.canceled && res.assets[0]?.uri) {
      setRenewalProofUri(res.assets[0].uri)
    }
  }

  const totalSpent = Number(member?.total_spent || 0)
  const totalBookings = Number(member?.total_bookings || 0)
  const confirmedBookings = Number(member?.confirm_bookings || 0)
  const pendingBookings = Number(member?.pending_bookings || 0)
  const cashbackEarned = Number(member?.total_point_cashback_earned || member?.points || 0)

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      {/* Profil Member Card */}
      <GradientCard className="p-5 mb-5">
        <View className="flex-row items-center mb-4">
          <View className="relative">
            <View className="w-16 h-16 rounded-full overflow-hidden bg-slate-800 border-2 border-cyan-400 items-center justify-center">
              {member?.profile_image_url ? (
                <Image source={{ uri: member.profile_image_url }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <User size={32} color="#94A3B8" />
              )}
            </View>
            <TouchableOpacity
              onPress={handleChangePhoto}
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-blue-600 border border-cyan-400 items-center justify-center"
            >
              <Camera size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View className="ml-4 flex-1">
            <Text className="text-white font-extrabold text-base mb-0.5">{member?.name || user?.name}</Text>
            <Text className="text-slate-400 text-xs mb-1.5">{member?.email || user?.email}</Text>
            <View className="flex-row items-center gap-1.5">
              <View className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40">
                <Text className="text-cyan-300 font-bold text-[10px] uppercase">Member BarberSip</Text>
              </View>
              {member?.active_until && (
                <Text className="text-slate-400 text-[10px]">
                  Aktif s/d: {member.active_until.split("T")[0]}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-2 pt-3 border-t border-slate-800">
          <TouchableOpacity
            onPress={openPoints}
            className="flex-1 py-2 px-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex-row items-center justify-center gap-1.5"
          >
            <Coins size={14} color="#FBBF24" />
            <Text className="text-amber-300 text-xs font-bold">Mutasi Poin</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPasswordModalOpen(true)}
            className="flex-1 py-2 px-2.5 rounded-xl bg-slate-800 border border-slate-700 flex-row items-center justify-center gap-1.5"
          >
            <KeyRound size={14} color="#94A3B8" />
            <Text className="text-slate-300 text-xs font-semibold">Ganti Sandi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setRenewalModalOpen(true)}
            className="flex-1 py-2 px-2.5 rounded-xl bg-blue-600/30 border border-blue-500/50 flex-row items-center justify-center gap-1.5"
          >
            <RefreshCw size={14} color="#22D3EE" />
            <Text className="text-cyan-300 text-xs font-bold">Perpanjang</Text>
          </TouchableOpacity>
        </View>
      </GradientCard>

      {/* 5 Kartu Statistik Member */}
      <Text className="text-slate-300 font-bold text-sm mb-3">Statistik Transaksi</Text>
      <View className="flex-row flex-wrap justify-between gap-y-3 mb-6">
        <View className="w-[48%]">
          <SummaryCard
            title="Total Belanja"
            value={formatRupiah(totalSpent)}
            variant="blue"
            icon={<CreditCard size={18} color="#22D3EE" />}
          />
        </View>
        <View className="w-[48%]">
          <SummaryCard
            title="Cashback Poin"
            value={cashbackEarned.toLocaleString("id-ID")}
            variant="yellow"
            icon={<Coins size={18} color="#FBBF24" />}
          />
        </View>
        <View className="w-[48%]">
          <SummaryCard
            title="Total Booking"
            value={totalBookings}
            variant="blue"
            icon={<Calendar size={18} color="#60A5FA" />}
          />
        </View>
        <View className="w-[48%]">
          <SummaryCard
            title="Selesai"
            value={confirmedBookings}
            variant="green"
            icon={<CheckCircle size={18} color="#34D399" />}
          />
        </View>
        <View className="w-full">
          <SummaryCard
            title="Booking Menunggu"
            value={pendingBookings}
            variant="red"
            icon={<Clock size={18} color="#FB7185" />}
          />
        </View>
      </View>

      {/* MODAL MUTASI POIN */}
      <CustomModal
        visible={pointModalOpen}
        onClose={() => setPointModalOpen(false)}
        title="Rincian Mutasi Poin"
      >
        {loadingPoints ? (
          <ActivityIndicator size="small" color="#FBBF24" className="py-6" />
        ) : pointHistory.length === 0 ? (
          <Text className="text-slate-400 text-center py-6 text-xs">Belum ada riwayat mutasi poin.</Text>
        ) : (
          <ScrollView className="max-h-80">
            {pointHistory.map((item, idx) => (
              <View
                key={item.id || idx}
                className="py-2.5 border-b border-slate-800 flex-row justify-between items-center"
              >
                <View className="flex-1 mr-2">
                  <Text className="text-white font-semibold text-xs mb-0.5">{item.activity}</Text>
                  <Text className="text-slate-500 text-[10px]">{formatDateTime(item.tanggal)}</Text>
                  {item.booking_code && (
                    <Text className="text-cyan-400 text-[10px] mt-0.5">Kode: {item.booking_code}</Text>
                  )}
                </View>
                <Text
                  className={`font-bold text-xs ${
                    Number(item.point_change) >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {Number(item.point_change) >= 0 ? `+${item.point_change}` : item.point_change} Poin
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </CustomModal>

      {/* MODAL GANTI PASSWORD */}
      <CustomModal
        visible={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Ubah Kata Sandi"
      >
        <View>
          <FloatingInput
            label="Kata Sandi Lama"
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry
            className="mb-2.5"
          />
          <FloatingInput
            label="Kata Sandi Baru (Min. 6 Karakter)"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            className="mb-2.5"
          />
          <FloatingInput
            label="Konfirmasi Kata Sandi Baru"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            className="mb-4"
          />
          <PrimaryButton
            title="Simpan Perubahan"
            onPress={handleChangePassword}
            loading={savingPassword}
          />
        </View>
      </CustomModal>

      {/* MODAL RENEWAL MEMBERSHIP */}
      <CustomModal
        visible={renewalModalOpen}
        onClose={() => setRenewalModalOpen(false)}
        title="Perpanjangan Membership"
      >
        <ScrollView className="max-h-96">
          <Text className="text-slate-300 text-xs mb-3 leading-relaxed">
            Biaya perpanjangan member sebesar{" "}
            <Text className="text-cyan-400 font-bold">
              {formatRupiah(Number(settings?.membership_annual_fee || 50000))}
            </Text>{" "}
            untuk 1 tahun masa aktif.
          </Text>

          {/* QRIS Image */}
          <View className="bg-slate-900 p-3 rounded-xl border border-slate-800 items-center mb-3">
            <Image
              source={require("../../../assets/qris-sample.png")}
              className="w-36 h-36 rounded-lg mb-2"
              resizeMode="contain"
            />
            <TouchableOpacity
              onPress={pickRenewalProof}
              className="w-full py-2 px-3 rounded-lg bg-blue-600/30 border border-blue-500/50 flex-row items-center justify-center gap-2"
            >
              <Upload size={14} color="#22D3EE" />
              <Text className="text-cyan-300 text-xs font-semibold">
                {renewalProofUri ? "Ganti Bukti Transfer" : "Unggah Bukti Transfer"}
              </Text>
            </TouchableOpacity>
            {renewalProofUri && (
              <Text className="text-emerald-400 text-[10px] mt-1.5">✓ Bukti siap dikirim</Text>
            )}
          </View>

          <PrimaryButton
            title="Kirim Bukti Perpanjangan"
            onPress={handleRenewal}
            loading={submittingRenewal}
          />
        </ScrollView>
      </CustomModal>
    </ScrollView>
  )
}

