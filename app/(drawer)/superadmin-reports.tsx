import React, { useState } from "react"
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
  FileSpreadsheet,
  Download,
  CalendarCheck,
  ShoppingBag,
  Clock,
  Printer,
} from "lucide-react-native"
import { PageHeader } from "../../src/components/layout/PageHeader"
import { GradientCard } from "../../src/components/ui/GradientCard"
import { GlassCard } from "../../src/components/ui/GlassCard"
import { FloatingInput } from "../../src/components/ui/FloatingInput"
import { PrimaryButton } from "../../src/components/ui/PrimaryButton"
import { apiFetch } from "../../src/api/client"
import { formatRupiah } from "../../src/lib/format"
import { useAppSettings } from "../../src/hooks/useAppSettings"

type ExportType = "bookings" | "products" | "attendance"

export default function SuperadminReportsScreen() {
  const { settings } = useAppSettings()
  const [reportType, setReportType] = useState<ExportType>("bookings")

  const now = new Date()
  const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
  const todayStr = now.toISOString().split("T")[0]

  const [fromDate, setFromDate] = useState(firstDay)
  const [toDate, setToDate] = useState(todayStr)
  const [loading, setLoading] = useState(false)

  const handleExportPdf = async () => {
    if (!fromDate || !toDate) {
      Alert.alert("Perhatian", "Pilih rentang tanggal terlebih dahulu.")
      return
    }

    try {
      setLoading(true)
      const endpoint =
        reportType === "bookings"
          ? `/api/reports/bookings?from=${fromDate}&to=${toDate}`
          : reportType === "products"
          ? `/api/reports/products?from=${fromDate}&to=${toDate}`
          : `/api/reports/attendance?from=${fromDate}&to=${toDate}`

      const res = await apiFetch<any>(endpoint)
      const rows: any[] = Array.isArray(res) ? res : Array.isArray(res?.rows) ? res.rows : []

      if (rows.length === 0) {
        Alert.alert("Info", "Tidak ada data pada rentang tanggal yang dipilih.")
        return
      }

      const outletName = settings?.company_name || "BARBERSIP"
      const title =
        reportType === "bookings"
          ? "LAPORAN TRANSAKSI BOOKING LAYANAN"
          : reportType === "products"
          ? "LAPORAN PENJUALAN PRODUK"
          : "LAPORAN AUDIT ABSENSI CAPSTER"

      let tableRowsHtml = ""
      let totalSum = 0

      if (reportType === "bookings") {
        totalSum = rows.reduce((sum, r) => sum + Number(r.total_amount || 0), 0)
        tableRowsHtml = rows
          .map(
            (r, idx) => `
          <tr style="border-bottom: 1px solid #ddd; font-size: 11px;">
            <td style="padding: 6px;">${idx + 1}</td>
            <td style="padding: 6px;">${r.booking_date} ${r.booking_time}</td>
            <td style="padding: 6px; font-weight: bold;">${r.booking_code}</td>
            <td style="padding: 6px;">${r.customer_name || "-"}</td>
            <td style="padding: 6px;">${r.barber_name || "-"}</td>
            <td style="padding: 6px; text-align: right;">${formatRupiah(r.total_amount)}</td>
            <td style="padding: 6px; text-align: center;">${r.booking_status || "-"}</td>
          </tr>`
          )
          .join("")
      } else if (reportType === "products") {
        totalSum = rows.reduce((sum, r) => sum + Number(r.total_amount || 0), 0)
        tableRowsHtml = rows
          .map(
            (r, idx) => `
          <tr style="border-bottom: 1px solid #ddd; font-size: 11px;">
            <td style="padding: 6px;">${idx + 1}</td>
            <td style="padding: 6px; font-weight: bold;">${r.order_code}</td>
            <td style="padding: 6px;">${r.customer_name || "-"}</td>
            <td style="padding: 6px;">${r.created_at?.split("T")[0] || "-"}</td>
            <td style="padding: 6px; text-align: right;">${formatRupiah(r.total_amount)}</td>
            <td style="padding: 6px; text-align: center;">${r.payment_status || "-"}</td>
          </tr>`
          )
          .join("")
      } else {
        tableRowsHtml = rows
          .map(
            (r, idx) => `
          <tr style="border-bottom: 1px solid #ddd; font-size: 11px;">
            <td style="padding: 6px;">${idx + 1}</td>
            <td style="padding: 6px;">${r.attendance_date}</td>
            <td style="padding: 6px; font-weight: bold;">${r.barber_name || "-"}</td>
            <td style="padding: 6px;">${r.check_in_at?.split("T")[1]?.slice(0, 5) || "--:--"}</td>
            <td style="padding: 6px;">${r.check_out_at?.split("T")[1]?.slice(0, 5) || "--:--"}</td>
            <td style="padding: 6px; text-align: center;">${r.is_late ? "Terlambat" : "Tepat Waktu"}</td>
          </tr>`
          )
          .join("")
      }

      const html = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 24px; color: #111;">
            <div style="text-align: center; margin-bottom: 16px; border-bottom: 2px solid #000; padding-bottom: 12px;">
              <h1 style="margin: 0; font-size: 20px;">${outletName}</h1>
              <h2 style="margin: 4px 0; font-size: 14px; font-weight: bold; color: #125AB8;">${title}</h2>
              <div style="font-size: 11px; color: #555;">Periode: ${fromDate} s/d ${toDate}</div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <thead>
                <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-size: 11px; text-align: left;">
                  <th style="padding: 6px;">No</th>
                  ${
                    reportType === "bookings"
                      ? `<th style="padding: 6px;">Waktu</th><th style="padding: 6px;">Kode</th><th style="padding: 6px;">Pelanggan</th><th style="padding: 6px;">Capster</th><th style="padding: 6px; text-align: right;">Total</th><th style="padding: 6px; text-align: center;">Status</th>`
                      : reportType === "products"
                      ? `<th style="padding: 6px;">Kode</th><th style="padding: 6px;">Pelanggan</th><th style="padding: 6px;">Tanggal</th><th style="padding: 6px; text-align: right;">Total</th><th style="padding: 6px; text-align: center;">Status</th>`
                      : `<th style="padding: 6px;">Tanggal</th><th style="padding: 6px;">Capster</th><th style="padding: 6px;">In</th><th style="padding: 6px;">Out</th><th style="padding: 6px; text-align: center;">Keterangan</th>`
                  }
                </tr>
              </thead>
              <tbody>
                ${tableRowsHtml}
              </tbody>
            </table>

            ${
              reportType !== "attendance"
                ? `
              <div style="text-align: right; font-size: 13px; font-weight: bold; padding: 8px; border-top: 2px solid #000;">
                GRAND TOTAL: ${formatRupiah(totalSum)}
              </div>`
                : ""
            }

            <div style="margin-top: 32px; display: flex; justify-content: flex-end;">
              <div style="text-align: center; font-size: 11px;">
                <div>Dicetak pada: ${new Date().toLocaleString("id-ID")}</div>
                <div style="margin-top: 48px; font-weight: bold;">( Manajemen Eksekutif )</div>
              </div>
            </div>
          </body>
        </html>
      `

      await Print.printAsync({ html })
    } catch (err: any) {
      Alert.alert("Gagal Export", err?.message || "Terjadi kendala saat export PDF.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      <PageHeader
        title="Laporan Eksekutif"
        subtitle="Ekspor dan audit laporan omzet, penjualan produk, dan absensi format PDF A4"
      />

      {/* Tipe Laporan Tabs */}
      <View className="flex-row bg-slate-900/90 p-1 rounded-2xl border border-slate-800 mb-4">
        {[
          { key: "bookings" as ExportType, label: "Booking", icon: CalendarCheck },
          { key: "products" as ExportType, label: "Produk", icon: ShoppingBag },
          { key: "attendance" as ExportType, label: "Absensi", icon: Clock },
        ].map((t) => {
          const Icon = t.icon
          const isActive = reportType === t.key
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setReportType(t.key)}
              className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center ${
                isActive ? "bg-blue-600 border border-cyan-400/50 shadow" : ""
              }`}
            >
              <Icon size={14} color={isActive ? "#FFFFFF" : "#94A3B8"} />
              <Text className={`text-xs ml-1.5 font-bold ${isActive ? "text-white" : "text-slate-400"}`}>
                {t.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Date Range Inputs */}
      <GradientCard className="p-5 mb-6">
        <Text className="text-white font-bold text-sm mb-3">Tentukan Rentang Tanggal</Text>
        <FloatingInput
          label="Dari Tanggal (YYYY-MM-DD)"
          value={fromDate}
          onChangeText={setFromDate}
          className="mb-2.5"
        />
        <FloatingInput
          label="Sampai Tanggal (YYYY-MM-DD)"
          value={toDate}
          onChangeText={setToDate}
          className="mb-4"
        />

        <PrimaryButton
          title="Export & Cetak PDF"
          onPress={handleExportPdf}
          loading={loading}
        />
      </GradientCard>
    </ScrollView>
  )
}

