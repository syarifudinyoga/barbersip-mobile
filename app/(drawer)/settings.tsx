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
  Settings,
  Clock,
  MapPin,
  Coins,
  Phone,
  Save,
} from "lucide-react-native"
import { PageHeader } from "../../src/components/layout/PageHeader"
import { GradientCard } from "../../src/components/ui/GradientCard"
import { FloatingInput } from "../../src/components/ui/FloatingInput"
import { PrimaryButton } from "../../src/components/ui/PrimaryButton"
import { apiFetch } from "../../src/api/client"

type TabKey = "operasional" | "gps" | "membership" | "kontak"

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>("operasional")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states
  const [openingTime, setOpeningTime] = useState("09:00")
  const [closingTime, setClosingTime] = useState("21:00")
  const [lastBookingMinutes, setLastBookingMinutes] = useState("60")

  const [latitude, setLatitude] = useState("-6.81143")
  const [longitude, setLongitude] = useState("107.95797")
  const [radiusMeters, setRadiusMeters] = useState("1000")

  const [membershipFee, setMembershipFee] = useState("50000")
  const [renewalFee, setRenewalFee] = useState("50000")
  const [memberPointsReserve, setMemberPointsReserve] = useState("5000")

  const [callCenterWhatsapp, setCallCenterWhatsapp] = useState("628123456789")

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true)
        const res = await apiFetch<any>("/api/settings")
        if (res) {
          setOpeningTime(res.opening_time || "09:00")
          setClosingTime(res.closing_time || "21:00")
          setLastBookingMinutes(String(res.last_booking_before_close_minutes ?? 60))
          setLatitude(String(res.attendance_latitude ?? -6.81143))
          setLongitude(String(res.attendance_longitude ?? 107.95797))
          setRadiusMeters(String(res.attendance_radius_meters ?? 1000))
          setMembershipFee(String(res.membership_fee ?? 50000))
          setRenewalFee(String(res.membership_renewal_fee ?? 50000))
          setMemberPointsReserve(String(res.member_points_reserve ?? 5000))
          setCallCenterWhatsapp(res.call_center_whatsapp || "")
        }
      } catch (err) {
        console.warn("Failed loading settings:", err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      const payload = {
        opening_time: openingTime,
        closing_time: closingTime,
        last_booking_before_close_minutes: Number(lastBookingMinutes),
        attendance_latitude: Number(latitude),
        attendance_longitude: Number(longitude),
        attendance_radius_meters: Number(radiusMeters),
        membership_fee: Number(membershipFee),
        membership_renewal_fee: Number(renewalFee),
        member_points_reserve: Number(memberPointsReserve),
        call_center_whatsapp: callCenterWhatsapp,
      }

      await apiFetch("/api/settings", {
        method: "PATCH",
        body: JSON.stringify(payload),
      })
      Alert.alert("Sukses", "Pengaturan sistem berhasil disimpan.")
    } catch (err: any) {
      Alert.alert("Gagal", err?.message || "Gagal menyimpan pengaturan.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      <PageHeader
        title="Pengaturan Sistem"
        subtitle="Konfigurasi parameter global operasional, absensi GPS, dan keanggotaan"
      />

      {/* Tabs */}
      <View className="flex-row bg-slate-900/90 p-1 rounded-2xl border border-slate-800 mb-4">
        {[
          { key: "operasional" as TabKey, label: "Operasional", icon: Clock },
          { key: "gps" as TabKey, label: "GPS Outlet", icon: MapPin },
          { key: "membership" as TabKey, label: "Member", icon: Coins },
          { key: "kontak" as TabKey, label: "Kontak", icon: Phone },
        ].map((t) => {
          const Icon = t.icon
          const isActive = activeTab === t.key
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setActiveTab(t.key)}
              className={`flex-1 py-2 rounded-xl flex-row items-center justify-center ${
                isActive ? "bg-blue-600 border border-cyan-400/50 shadow" : ""
              }`}
            >
              <Icon size={12} color={isActive ? "#FFFFFF" : "#94A3B8"} />
              <Text className={`text-[11px] ml-1 font-bold ${isActive ? "text-white" : "text-slate-400"}`}>
                {t.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#22D3EE" className="py-8" />
      ) : (
        <GradientCard className="p-5 mb-8">
          {activeTab === "operasional" && (
            <View>
              <Text className="text-white font-bold text-sm mb-3">Jam Buka & Reservasi</Text>
              <FloatingInput label="Jam Buka Toko (HH:MM)" value={openingTime} onChangeText={setOpeningTime} className="mb-2.5" />
              <FloatingInput label="Jam Tutup Toko (HH:MM)" value={closingTime} onChangeText={setClosingTime} className="mb-2.5" />
              <FloatingInput label="Batas Terakhir Booking Sebelum Tutup (Menit)" value={lastBookingMinutes} onChangeText={setLastBookingMinutes} keyboardType="numeric" className="mb-4" />
            </View>
          )}

          {activeTab === "gps" && (
            <View>
              <Text className="text-white font-bold text-sm mb-3">Koordinat Outlet & Geofence</Text>
              <FloatingInput label="Latitude Outlet" value={latitude} onChangeText={setLatitude} keyboardType="numeric" className="mb-2.5" />
              <FloatingInput label="Longitude Outlet" value={longitude} onChangeText={setLongitude} keyboardType="numeric" className="mb-2.5" />
              <FloatingInput label="Radius Maksimal Absensi (Meter)" value={radiusMeters} onChangeText={setRadiusMeters} keyboardType="numeric" className="mb-4" />
            </View>
          )}

          {activeTab === "membership" && (
            <View>
              <Text className="text-white font-bold text-sm mb-3">Tarif & Cadangan Poin</Text>
              <FloatingInput label="Biaya Member Baru (Rp)" value={membershipFee} onChangeText={setMembershipFee} keyboardType="numeric" className="mb-2.5" />
              <FloatingInput label="Biaya Renewal Tahunan (Rp)" value={renewalFee} onChangeText={setRenewalFee} keyboardType="numeric" className="mb-2.5" />
              <FloatingInput label="Cadangan Poin Minimum Member (Poin)" value={memberPointsReserve} onChangeText={setMemberPointsReserve} keyboardType="numeric" className="mb-4" />
            </View>
          )}

          {activeTab === "kontak" && (
            <View>
              <Text className="text-white font-bold text-sm mb-3">Call Center & Layanan Pelanggan</Text>
              <FloatingInput label="Nomor WhatsApp CS (Cth: 628123456789)" value={callCenterWhatsapp} onChangeText={setCallCenterWhatsapp} keyboardType="phone-pad" className="mb-4" />
            </View>
          )}

          <PrimaryButton
            title="Simpan Pengaturan"
            onPress={handleSave}
            loading={saving}
          />
        </GradientCard>
      )}
    </ScrollView>
  )
}

