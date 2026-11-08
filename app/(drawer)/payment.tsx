import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native"
import * as Print from "expo-print"
import {
  ReceiptText,
  Printer,
  Search,
  Scissors,
  ShoppingBag,
  CreditCard,
  CheckCircle,
} from "lucide-react-native"
import { PageHeader } from "../../src/components/layout/PageHeader"
import { GlassCard } from "../../src/components/ui/GlassCard"
import { PrimaryButton } from "../../src/components/ui/PrimaryButton"
import { FloatingInput } from "../../src/components/ui/FloatingInput"
import { StatusBadge } from "../../src/components/ui/StatusBadge"
import { apiFetch } from "../../src/api/client"
import { formatRupiah, formatDateTime } from "../../src/lib/format"
import { useAppSettings } from "../../src/hooks/useAppSettings"

type PaymentTab = "booking" | "product"

export default function PaymentScreen() {
  const { settings } = useAppSettings()
  const [tab, setTab] = useState<PaymentTab>("booking")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const [bookingPayments, setBookingPayments] = useState<any[]>([])
  const [productPayments, setProductPayments] = useState<any[]>([])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const [resBookings, resProducts] = await Promise.allSettled([
        apiFetch<any[]>("/api/payment"),
        apiFetch<any[]>("/api/products/orders"),
      ])

      if (resBookings.status === "fulfilled" && Array.isArray(resBookings.value)) {
        setBookingPayments(resBookings.value)
      }
      if (resProducts.status === "fulfilled" && Array.isArray(resProducts.value)) {
        setProductPayments(resProducts.value)
      }
    } catch (err) {
      console.warn("Failed fetching payments:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  // Cetak Thermal Struk via expo-print
  const handlePrintBookingReceipt = async (item: any) => {
    try {
      const outletName = settings?.company_name || "BARBERSIP"
      const outletAddress = settings?.company_address || "Jakarta, Indonesia"
      const outletPhone = settings?.call_center_whatsapp || "08123456789"

      const servicesHtml = (item.services || [])
        .map(
          (s: any) => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px;">
            <span>${s.name}</span>
            <span>${formatRupiah(s.price)}</span>
          </div>`
        )
        .join("")

      const html = `
        <html>
          <body style="font-family: monospace; padding: 12px; width: 280px; margin: 0 auto; color: #000;">
            <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px;">
              <h2 style="margin: 0; font-size: 16px; font-weight: bold;">${outletName}</h2>
              <div style="font-size: 10px;">${outletAddress}</div>
              <div style="font-size: 10px;">WA: +${outletPhone}</div>
            </div>

            <div style="font-size: 10px; margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 6px;">
              <div>No: <b>${item.booking_code}</b></div>
              <div>Tgl: ${item.booking_date} ${item.booking_time}</div>
              <div>Kasir/Capster: ${item.barber_name || "-"}</div>
              <div>Pelanggan: ${item.customer_name || "-"}</div>
            </div>

            <div style="margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 6px;">
              ${servicesHtml || "<div style='font-size: 10px;'>Treatment Layanan</div>"}
            </div>

            <div style="font-size: 11px; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-weight: bold;">
                <span>TOTAL:</span>
                <span>${formatRupiah(item.total_amount)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 10px;">
                <span>Metode:</span>
                <span>${item.payment_method || "TUNAI"}</span>
              </div>
            </div>

            <div style="text-align: center; font-size: 10px; border-top: 1px dashed #000; padding-top: 8px;">
              <div>Terima kasih atas kunjungan Anda</div>
              <div>Grooming Makes You Confident!</div>
            </div>
          </body>
        </html>
      `

      await Print.printAsync({ html })
    } catch (err: any) {
      Alert.alert("Gagal Mencetak", err?.message || "Tidak dapat memproses print.")
    }
  }

  const filteredBookings = bookingPayments.filter((b) =>
    (b.booking_code || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.customer_name || "").toLowerCase().includes(search.toLowerCase())
  )

  const filteredProducts = productPayments.filter((p) =>
    (p.order_code || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.customer_name || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      <PageHeader
        title="Kasir & Struk Pembayaran"
        subtitle="Daftar pembayaran lunas dan cetak struk invoice thermal printer 58mm/80mm"
      />

      {/* Tabs Switcher */}
      <View className="flex-row bg-slate-900/90 p-1 rounded-2xl border border-slate-800 mb-4">
        <TouchableOpacity
          onPress={() => setTab("booking")}
          className={`flex-1 py-2 rounded-xl flex-row items-center justify-center ${
            tab === "booking" ? "bg-blue-600 border border-cyan-400/50 shadow" : ""
          }`}
        >
          <Scissors size={14} color={tab === "booking" ? "#FFFFFF" : "#94A3B8"} />
          <Text className={`text-xs ml-1.5 font-bold ${tab === "booking" ? "text-white" : "text-slate-400"}`}>
            Struk Booking
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab("product")}
          className={`flex-1 py-2 rounded-xl flex-row items-center justify-center ${
            tab === "product" ? "bg-blue-600 border border-cyan-400/50 shadow" : ""
          }`}
        >
          <ShoppingBag size={14} color={tab === "product" ? "#FFFFFF" : "#94A3B8"} />
          <Text className={`text-xs ml-1.5 font-bold ${tab === "product" ? "text-white" : "text-slate-400"}`}>
            Struk Produk
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View className="mb-4">
        <FloatingInput
          label="Cari kode transaksi / pelanggan..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#22D3EE" className="py-8" />
      ) : tab === "booking" ? (
        filteredBookings.length === 0 ? (
          <GlassCard className="p-6 items-center">
            <Text className="text-slate-400 text-xs">Belum ada transaksi pembayaran booking.</Text>
          </GlassCard>
        ) : (
          <View className="gap-3 mb-10">
            {filteredBookings.map((item) => (
              <GlassCard key={item.id} className="p-4 border-slate-800">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-cyan-400 font-black text-xs">{item.booking_code}</Text>
                  <StatusBadge status={item.payment_status || "PAID"} />
                </View>

                <View className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 mb-3 space-y-1">
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-xs">Pelanggan</Text>
                    <Text className="text-slate-200 text-xs font-semibold">{item.customer_name}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-xs">Capster</Text>
                    <Text className="text-slate-200 text-xs">{item.barber_name}</Text>
                  </View>
                  <View className="flex-row justify-between pt-1 border-t border-slate-800">
                    <Text className="text-slate-400 text-xs">Total Pembayaran</Text>
                    <Text className="text-emerald-400 text-xs font-bold">{formatRupiah(item.total_amount)}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handlePrintBookingReceipt(item)}
                  className="w-full py-2.5 rounded-xl bg-blue-600/30 border border-cyan-400 flex-row items-center justify-center gap-2"
                >
                  <Printer size={16} color="#22D3EE" />
                  <Text className="text-cyan-300 font-bold text-xs">Cetak Struk Thermal</Text>
                </TouchableOpacity>
              </GlassCard>
            ))}
          </View>
        )
      ) : (
        filteredProducts.length === 0 ? (
          <GlassCard className="p-6 items-center">
            <Text className="text-slate-400 text-xs">Belum ada transaksi pembayaran produk.</Text>
          </GlassCard>
        ) : (
          <View className="gap-3 mb-10">
            {filteredProducts.map((p) => (
              <GlassCard key={p.id} className="p-4 border-slate-800">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-purple-400 font-black text-xs">{p.order_code}</Text>
                  <StatusBadge status={p.payment_status} />
                </View>

                <View className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 mb-3 space-y-1">
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-xs">Pelanggan</Text>
                    <Text className="text-slate-200 text-xs font-semibold">{p.customer_name}</Text>
                  </View>
                  <View className="flex-row justify-between pt-1 border-t border-slate-800">
                    <Text className="text-slate-400 text-xs">Total Tagihan</Text>
                    <Text className="text-cyan-300 text-xs font-bold">{formatRupiah(p.total_amount)}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handlePrintBookingReceipt({
                    booking_code: p.order_code,
                    booking_date: p.created_at?.split("T")[0] || "",
                    booking_time: "",
                    customer_name: p.customer_name,
                    barber_name: "Kasir Store",
                    total_amount: p.total_amount,
                    payment_method: p.payment_method || "QRIS",
                    services: p.items || [],
                  })}
                  className="w-full py-2.5 rounded-xl bg-purple-600/30 border border-purple-400 flex-row items-center justify-center gap-2"
                >
                  <Printer size={16} color="#C084FC" />
                  <Text className="text-purple-300 font-bold text-xs">Cetak Struk Produk</Text>
                </TouchableOpacity>
              </GlassCard>
            ))}
          </View>
        )
      )}
    </ScrollView>
  )
}

