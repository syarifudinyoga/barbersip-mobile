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
  ShoppingBag,
  Search,
  Check,
  X,
  Eye,
  RefreshCw,
  Truck,
} from "lucide-react-native"
import { PageHeader } from "../../src/components/layout/PageHeader"
import { GlassCard } from "../../src/components/ui/GlassCard"
import { PrimaryButton } from "../../src/components/ui/PrimaryButton"
import { FloatingInput } from "../../src/components/ui/FloatingInput"
import { StatusBadge } from "../../src/components/ui/StatusBadge"
import { CustomModal } from "../../src/components/ui/CustomModal"
import { apiFetch } from "../../src/api/client"
import { formatRupiah, formatDateTime } from "../../src/lib/format"

interface OrderItem {
  id: string
  order_code: string
  customer_name: string
  customer_whatsapp?: string
  total_amount: number
  payment_status: string
  payment_proof_url?: string | null
  delivery_address?: string | null
  created_at: string
  items?: { name: string; quantity: number; subtotal?: number }[]
}

export default function ProductOrdersScreen() {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [proofUrl, setProofUrl] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<any[]>("/api/products/orders")
      setOrders(Array.isArray(res) ? res : [])
    } catch (err) {
      console.warn("Failed fetching product orders:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await apiFetch(`/api/products/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ payment_status: status }),
      })
      Alert.alert("Sukses", `Status pesanan diubah ke ${status}.`)
      fetchOrders()
      setSelectedOrder(null)
    } catch (err: any) {
      Alert.alert("Gagal", err?.message || "Gagal memperbarui status.")
    }
  }

  const filtered = orders.filter((o) =>
    (o.order_code || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.customer_name || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      <PageHeader
        title="Pesanan Produk"
        subtitle="Verifikasi bukti transfer pembayaran dan kelola status pengiriman produk"
      />

      {/* Search Input */}
      <View className="mb-4">
        <FloatingInput
          label="Cari kode pesanan / pelanggan..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#22D3EE" className="py-8" />
      ) : filtered.length === 0 ? (
        <GlassCard className="p-6 items-center">
          <Text className="text-slate-400 text-xs">Belum ada pesanan produk.</Text>
        </GlassCard>
      ) : (
        <View className="gap-3 mb-10">
          {filtered.map((o) => (
            <GlassCard key={o.id} className="p-4 border-slate-800">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-purple-400 font-black text-xs">{o.order_code}</Text>
                <StatusBadge status={o.payment_status} />
              </View>

              <View className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 mb-3 space-y-1">
                <View className="flex-row justify-between">
                  <Text className="text-slate-400 text-xs">Pemesan</Text>
                  <Text className="text-slate-200 text-xs font-semibold">{o.customer_name}</Text>
                </View>
                {o.customer_whatsapp && (
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-xs">WhatsApp</Text>
                    <Text className="text-slate-300 text-xs">{o.customer_whatsapp}</Text>
                  </View>
                )}
                {o.delivery_address && (
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-xs">Alamat</Text>
                    <Text className="text-slate-300 text-xs" numberOfLines={1}>{o.delivery_address}</Text>
                  </View>
                )}
                <View className="flex-row justify-between pt-1 border-t border-slate-800">
                  <Text className="text-slate-400 text-xs">Total Pesanan</Text>
                  <Text className="text-cyan-400 text-xs font-bold">{formatRupiah(o.total_amount)}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-2">
                {o.payment_proof_url && (
                  <TouchableOpacity
                    onPress={() => setProofUrl(o.payment_proof_url!)}
                    className="p-2 rounded-xl bg-slate-800 border border-slate-700"
                  >
                    <Eye size={16} color="#22D3EE" />
                  </TouchableOpacity>
                )}

                {o.payment_status === "WAITING_VERIFICATION" && (
                  <TouchableOpacity
                    onPress={() => handleUpdateStatus(o.id, "PAID")}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 border border-emerald-400 flex-row items-center justify-center gap-1"
                  >
                    <Check size={14} color="#FFFFFF" />
                    <Text className="text-white font-bold text-xs">Konfirmasi Bayar</Text>
                  </TouchableOpacity>
                )}

                {o.payment_status === "PAID" && (
                  <TouchableOpacity
                    onPress={() => handleUpdateStatus(o.id, "COMPLETED")}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 border border-cyan-400 flex-row items-center justify-center gap-1"
                  >
                    <Truck size={14} color="#FFFFFF" />
                    <Text className="text-white font-bold text-xs">Kirim / Selesaikan</Text>
                  </TouchableOpacity>
                )}
              </View>
            </GlassCard>
          ))}
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
    </ScrollView>
  )
}

