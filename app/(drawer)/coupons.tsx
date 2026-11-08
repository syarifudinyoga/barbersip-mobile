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
  Ticket,
  Plus,
  Trash2,
  Copy,
  Percent,
} from "lucide-react-native"
import { PageHeader } from "../../src/components/layout/PageHeader"
import { GlassCard } from "../../src/components/ui/GlassCard"
import { FloatingInput } from "../../src/components/ui/FloatingInput"
import { CustomModal } from "../../src/components/ui/CustomModal"
import { PrimaryButton } from "../../src/components/ui/PrimaryButton"
import { StatusBadge } from "../../src/components/ui/StatusBadge"
import { apiFetch } from "../../src/api/client"
import { formatRupiah } from "../../src/lib/format"

interface CouponItem {
  id: string
  code: string
  discount_amount?: number
  discount_percentage?: number
  min_spend?: number
  max_usage?: number
  usage_count?: number
  is_active: boolean
}

export default function CouponsScreen() {
  const [coupons, setCoupons] = useState<CouponItem[]>([])
  const [loading, setLoading] = useState(true)

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [code, setCode] = useState("")
  const [discountAmount, setDiscountAmount] = useState("")
  const [minSpend, setMinSpend] = useState("")
  const [maxUsage, setMaxUsage] = useState("50")
  const [saving, setSaving] = useState(false)

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<CouponItem[]>("/api/coupons")
      setCoupons(Array.isArray(res) ? res : [])
    } catch (err) {
      console.warn("Failed fetching coupons:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleSave = async () => {
    if (!code.trim() || !discountAmount) {
      Alert.alert("Perhatian", "Kode kupon dan nominal potongan wajib diisi.")
      return
    }

    try {
      setSaving(true)
      await apiFetch("/api/coupons", {
        method: "POST",
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          discount_amount: Number(discountAmount),
          min_spend: Number(minSpend || 0),
          max_usage: Number(maxUsage || 100),
          is_active: true,
        }),
      })
      Alert.alert("Sukses", "Kupon diskon berhasil dibuat.")
      setModalOpen(false)
      setCode("")
      setDiscountAmount("")
      fetchCoupons()
    } catch (err: any) {
      Alert.alert("Gagal", err?.message || "Gagal membuat kupon.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (id: string) => {
    Alert.alert("Hapus Kupon", "Apakah kamu yakin ingin menghapus kupon ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await apiFetch(`/api/coupons/${id}`, { method: "DELETE" })
            Alert.alert("Sukses", "Kupon berhasil dihapus.")
            fetchCoupons()
          } catch (err: any) {
            Alert.alert("Gagal", err?.message || "Gagal menghapus kupon.")
          }
        },
      },
    ])
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      <PageHeader
        title="Kupon Diskon"
        subtitle="Kelola kode voucher potongan harga untuk promosi booking dan belanja"
      />

      <TouchableOpacity
        onPress={() => setModalOpen(true)}
        className="w-full py-3 rounded-2xl bg-blue-600 border border-cyan-400 flex-row items-center justify-center gap-2 mb-4 shadow-lg shadow-cyan-500/20"
      >
        <Plus size={18} color="#FFFFFF" />
        <Text className="text-white font-bold text-xs">Buat Kupon Baru</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="small" color="#22D3EE" className="py-8" />
      ) : coupons.length === 0 ? (
        <GlassCard className="p-6 items-center">
          <Text className="text-slate-400 text-xs">Belum ada kupon diskon.</Text>
        </GlassCard>
      ) : (
        <View className="gap-3 mb-10">
          {coupons.map((c) => (
            <GlassCard key={c.id} className="p-4 border-slate-800 flex-row items-center justify-between">
              <View className="flex-1 mr-2">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-cyan-400 font-black text-sm tracking-widest">{c.code}</Text>
                  <StatusBadge status={c.is_active ? "ACTIVE" : "INACTIVE"} />
                </View>
                <Text className="text-emerald-400 font-bold text-xs">
                  Potongan: {formatRupiah(c.discount_amount || 0)}
                </Text>
                <Text className="text-slate-400 text-[10px] mt-0.5">
                  Min. Belanja: {formatRupiah(c.min_spend || 0)} • Terpakai: {c.usage_count ?? 0}/{c.max_usage ?? "∞"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleDelete(c.id)}
                className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30"
              >
                <Trash2 size={14} color="#FB7185" />
              </TouchableOpacity>
            </GlassCard>
          ))}
        </View>
      )}

      {/* Modal Buat Kupon */}
      <CustomModal visible={modalOpen} onClose={() => setModalOpen(false)} title="Buat Kupon Baru">
        <View>
          <FloatingInput label="Kode Kupon (cth: DISKON50K)" value={code} onChangeText={setCode} autoCapitalize="characters" className="mb-2.5" />
          <FloatingInput label="Nominal Diskon (Rp)" value={discountAmount} onChangeText={setDiscountAmount} keyboardType="numeric" className="mb-2.5" />
          <FloatingInput label="Minimal Belanja (Rp)" value={minSpend} onChangeText={setMinSpend} keyboardType="numeric" className="mb-2.5" />
          <FloatingInput label="Batas Kuota Pemakaian" value={maxUsage} onChangeText={setMaxUsage} keyboardType="numeric" className="mb-4" />
          <PrimaryButton title="Simpan Kupon" onPress={handleSave} loading={saving} />
        </View>
      </CustomModal>
    </ScrollView>
  )
}

