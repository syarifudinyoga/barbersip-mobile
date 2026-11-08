import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import {
  Scissors,
  Calendar,
  Clock,
  User,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  CreditCard,
  Banknote,
  AlertCircle,
  Copy,
} from "lucide-react-native"
import { GradientCard } from "../ui/GradientCard"
import { GlassCard } from "../ui/GlassCard"
import { PrimaryButton } from "../ui/PrimaryButton"
import { FloatingInput } from "../ui/FloatingInput"
import { StatusBadge } from "../ui/StatusBadge"
import { apiFetch, uploadFile } from "../../api/client"
import { formatRupiah } from "../../lib/format"
import { useAppSettings } from "../../hooks/useAppSettings"

export interface BookingSectionProps {
  onSuccessBooking?: (code: string) => void
}

interface Barber {
  id: string
  name: string
  photo_url?: string | null
  available: boolean
  opening_time?: string
  closing_time?: string
  services: Service[]
}

interface Service {
  id: string
  name: string
  price: number
  regular_price?: number
  duration: number
  service_group?: string
  description?: string
  price_event_name?: string
}

interface TimeSlot {
  time: string
  available: boolean
}

export function BookingSection({ onSuccessBooking }: BookingSectionProps) {
  const { settings } = useAppSettings()
  const [step, setStep] = useState(1)

  // Data states
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loadingBarbers, setLoadingBarbers] = useState(true)
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)

  // Schedule states
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date()
    return now.toISOString().split("T")[0]
  })
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string>("")

  // Services states
  const [selectedServices, setSelectedServices] = useState<Service[]>([])

  // Customer & Payment states
  const [customerName, setCustomerName] = useState("")
  const [customerWhatsapp, setCustomerWhatsapp] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "CASH">("QRIS")
  const [paymentProofUri, setPaymentProofUri] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [createdBookingCode, setCreatedBookingCode] = useState<string | null>(null)

  // Load barbers
  useEffect(() => {
    async function loadBarbers() {
      try {
        setLoadingBarbers(true)
        const data = await apiFetch<Barber[]>("/api/barbers")
        setBarbers(data || [])
      } catch (err) {
        console.warn("Failed to load barbers:", err)
      } finally {
        setLoadingBarbers(false)
      }
    }
    loadBarbers()
  }, [])

  // Load available slots when barber & date change
  useEffect(() => {
    if (!selectedBarber || !selectedDate) return
    async function loadSlots() {
      try {
        setLoadingSlots(true)
        setSelectedTime("")
        const params = new URLSearchParams({
          date: selectedDate,
          barber_id: String(selectedBarber?.id),
        })
        const res = await apiFetch<TimeSlot[]>(`/api/bookings/slots/available-slots?${params}`)
        setAvailableSlots(res || [])
      } catch (err) {
        console.warn("Failed to load slots:", err)
      } finally {
        setLoadingSlots(false)
      }
    }
    loadSlots()
  }, [selectedBarber, selectedDate])

  const toggleService = (srv: Service) => {
    if (selectedServices.some((s) => s.id === srv.id)) {
      setSelectedServices(selectedServices.filter((s) => s.id !== srv.id))
    } else {
      setSelectedServices([...selectedServices, srv])
    }
  }

  const totalAmount = selectedServices.reduce((sum, s) => sum + Number(s.price || 0), 0)
  const totalDuration = selectedServices.reduce((sum, s) => sum + Number(s.duration || 0), 0)

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    })
    if (!res.canceled && res.assets[0]?.uri) {
      setPaymentProofUri(res.assets[0].uri)
    }
  }

  const handleSubmit = async () => {
    if (!selectedBarber || !selectedDate || !selectedTime || selectedServices.length === 0) {
      Alert.alert("Perhatian", "Mohon lengkapi jadwal dan layanan yang dipilih.")
      return
    }
    if (!customerName.trim() || !customerWhatsapp.trim()) {
      Alert.alert("Perhatian", "Nama dan No. WhatsApp wajib diisi.")
      return
    }
    if (paymentMethod === "QRIS" && !paymentProofUri) {
      Alert.alert("Perhatian", "Silakan upload bukti transfer QRIS terlebih dahulu.")
      return
    }

    try {
      setSubmitting(true)
      let paymentProofUrl: string | undefined

      if (paymentProofUri) {
        const uploadRes = await uploadFile(paymentProofUri)
        paymentProofUrl = uploadRes.url
      }

      const payload = {
        barber_id: selectedBarber.id,
        booking_date: selectedDate,
        booking_time: selectedTime,
        service_ids: selectedServices.map((s) => s.id),
        customer_name: customerName,
        customer_whatsapp: customerWhatsapp,
        customer_email: customerEmail || undefined,
        payment_method: paymentMethod,
        payment_proof_url: paymentProofUrl,
      }

      const res = await apiFetch<{ booking_code?: string; code?: string; id?: string }>("/api/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
      })

      const code = res.booking_code || res.code || res.id || "BS-" + Date.now().toString().slice(-6)
      setCreatedBookingCode(code)
      if (onSuccessBooking) onSuccessBooking(code)
    } catch (err: any) {
      Alert.alert("Gagal Booking", err?.message || "Terjadi kendala saat memproses booking.")
    } finally {
      setSubmitting(false)
    }
  }

  // Reset form
  const handleReset = () => {
    setStep(1)
    setSelectedBarber(null)
    setSelectedTime("")
    setSelectedServices([])
    setPaymentProofUri(null)
    setCreatedBookingCode(null)
  }

  // Generate 7 upcoming dates
  const upcomingDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      iso: d.toISOString().split("T")[0],
      dayName: d.toLocaleDateString("id-ID", { weekday: "short" }),
      dateNumber: d.getDate(),
      month: d.toLocaleDateString("id-ID", { month: "short" }),
    }
  })

  if (createdBookingCode) {
    return (
      <GradientCard className="p-6 items-center">
        <View className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 items-center justify-center mb-4">
          <Check size={36} color="#10B981" />
        </View>
        <Text className="text-white text-xl font-bold mb-1 text-center">Booking Berhasil Dibuat!</Text>
        <Text className="text-slate-400 text-xs text-center mb-5">
          Simpan kode booking kamu untuk melacak status dan check-in di kasir.
        </Text>

        <View className="w-full bg-slate-900/80 p-4 rounded-xl border border-blue-500/30 items-center mb-6">
          <Text className="text-slate-400 text-xs mb-1">Kode Booking Anda</Text>
          <Text className="text-cyan-400 text-2xl font-black tracking-widest">{createdBookingCode}</Text>
        </View>

        <PrimaryButton title="Booking Layanan Lain" onPress={handleReset} variant="secondary" className="w-full mb-2" />
      </GradientCard>
    )
  }

  return (
    <View className="mb-8">
      {/* Step Indicators */}
      <View className="flex-row items-center justify-between mb-4 px-2">
        {[
          { num: 1, label: "Capster" },
          { num: 2, label: "Jadwal" },
          { num: 3, label: "Layanan" },
          { num: 4, label: "Bayar" },
        ].map((s, idx) => (
          <View key={s.num} className="flex-row items-center">
            <View
              className={`w-7 h-7 rounded-full items-center justify-center border ${
                step >= s.num
                  ? "bg-blue-600 border-cyan-400"
                  : "bg-slate-800/80 border-slate-700"
              }`}
            >
              <Text className={`text-xs font-bold ${step >= s.num ? "text-white" : "text-slate-500"}`}>
                {s.num}
              </Text>
            </View>
            <Text className={`text-[11px] ml-1.5 font-medium ${step >= s.num ? "text-cyan-300" : "text-slate-500"}`}>
              {s.label}
            </Text>
            {idx < 3 && <View className="w-4 h-[1px] bg-slate-700 mx-1" />}
          </View>
        ))}
      </View>

      {/* STEP 1: PILIH CAPSTER */}
      {step === 1 && (
        <GradientCard className="p-5">
          <View className="flex-row items-center mb-4">
            <Scissors size={20} color="#22D3EE" />
            <Text className="text-white font-bold text-base ml-2">Pilih Capster Pilihanmu</Text>
          </View>

          {loadingBarbers ? (
            <ActivityIndicator size="small" color="#22D3EE" className="py-8" />
          ) : barbers.length === 0 ? (
            <Text className="text-slate-400 text-sm text-center py-6">Tidak ada capster yang tersedia saat ini.</Text>
          ) : (
            <View className="gap-3">
              {barbers.map((b) => {
                const isSelected = selectedBarber?.id === b.id
                return (
                  <TouchableOpacity
                    key={b.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedBarber(b)}
                    className={`p-3.5 rounded-xl border flex-row items-center justify-between ${
                      isSelected
                        ? "bg-blue-950/60 border-cyan-400 shadow-lg shadow-cyan-500/20"
                        : "bg-slate-900/60 border-slate-800/80"
                    }`}
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border border-slate-700 items-center justify-center mr-3">
                        {b.photo_url ? (
                          <Image source={{ uri: b.photo_url }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                          <User size={24} color="#94A3B8" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-semibold text-sm">{b.name}</Text>
                        <Text className="text-slate-400 text-xs">
                          {b.services?.length || 0} Layanan Tersedia
                        </Text>
                      </View>
                    </View>
                    {isSelected ? (
                      <View className="w-6 h-6 rounded-full bg-cyan-400 items-center justify-center">
                        <Check size={14} color="#030611" />
                      </View>
                    ) : (
                      <View className="w-6 h-6 rounded-full border border-slate-700" />
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          )}

          <PrimaryButton
            title="Lanjut Pilih Jadwal"
            onPress={() => setStep(2)}
            disabled={!selectedBarber}
            className="mt-5"
          />
        </GradientCard>
      )}

      {/* STEP 2: PILIH TANGGAL & JAM */}
      {step === 2 && (
        <GradientCard className="p-5">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Calendar size={20} color="#22D3EE" />
              <Text className="text-white font-bold text-base ml-2">Pilih Tanggal & Jam</Text>
            </View>
            <Text className="text-xs text-cyan-400 font-medium">{selectedBarber?.name}</Text>
          </View>

          {/* Date Picker Horizontal Rail */}
          <Text className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">Tanggal</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-5">
            {upcomingDates.map((item) => {
              const isSelected = selectedDate === item.iso
              return (
                <TouchableOpacity
                  key={item.iso}
                  onPress={() => setSelectedDate(item.iso)}
                  className={`mr-2.5 px-3.5 py-2.5 rounded-xl border items-center min-w-[65px] ${
                    isSelected
                      ? "bg-blue-600 border-cyan-400 shadow-md shadow-cyan-500/20"
                      : "bg-slate-900/70 border-slate-800"
                  }`}
                >
                  <Text className={`text-[11px] font-medium ${isSelected ? "text-cyan-200" : "text-slate-400"}`}>
                    {item.dayName}
                  </Text>
                  <Text className={`text-lg font-bold ${isSelected ? "text-white" : "text-slate-200"}`}>
                    {item.dateNumber}
                  </Text>
                  <Text className={`text-[10px] ${isSelected ? "text-cyan-100" : "text-slate-500"}`}>
                    {item.month}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          {/* Time Slots */}
          <Text className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">Jam Tersedia</Text>
          {loadingSlots ? (
            <ActivityIndicator size="small" color="#22D3EE" className="py-6" />
          ) : availableSlots.length === 0 ? (
            <Text className="text-slate-400 text-xs text-center py-5">
              Tidak ada slot jam yang tersedia untuk tanggal ini.
            </Text>
          ) : (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {availableSlots.map((slot) => {
                const isSelected = selectedTime === slot.time
                return (
                  <TouchableOpacity
                    key={slot.time}
                    disabled={!slot.available}
                    onPress={() => setSelectedTime(slot.time)}
                    className={`px-3 py-2 rounded-lg border items-center justify-center min-w-[70px] ${
                      !slot.available
                        ? "bg-slate-900/40 border-slate-800 opacity-40"
                        : isSelected
                        ? "bg-blue-600 border-cyan-400 shadow shadow-cyan-500/20"
                        : "bg-slate-800/80 border-slate-700"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        !slot.available ? "text-slate-600" : isSelected ? "text-white" : "text-slate-300"
                      }`}
                    >
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}

          <View className="flex-row gap-2 mt-4">
            <PrimaryButton
              title="Kembali"
              variant="secondary"
              onPress={() => setStep(1)}
              className="flex-1"
            />
            <PrimaryButton
              title="Pilih Layanan"
              onPress={() => setStep(3)}
              disabled={!selectedTime}
              className="flex-1"
            />
          </View>
        </GradientCard>
      )}

      {/* STEP 3: PILIH LAYANAN */}
      {step === 3 && (
        <GradientCard className="p-5">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Scissors size={20} color="#22D3EE" />
              <Text className="text-white font-bold text-base ml-2">Pilih Layanan</Text>
            </View>
            <Text className="text-xs text-cyan-400 font-medium">
              {selectedServices.length} Dipilih
            </Text>
          </View>

          {(!selectedBarber?.services || selectedBarber.services.length === 0) ? (
            <Text className="text-slate-400 text-xs text-center py-6">
              Capster ini belum memiliki daftar layanan.
            </Text>
          ) : (
            <View className="gap-2.5 mb-4">
              {selectedBarber.services.map((srv) => {
                const isSelected = selectedServices.some((s) => s.id === srv.id)
                return (
                  <TouchableOpacity
                    key={srv.id}
                    onPress={() => toggleService(srv)}
                    className={`p-3.5 rounded-xl border flex-row items-center justify-between ${
                      isSelected
                        ? "bg-blue-950/70 border-cyan-400"
                        : "bg-slate-900/60 border-slate-800"
                    }`}
                  >
                    <View className="flex-1 mr-3">
                      <Text className="text-white font-semibold text-sm mb-1">{srv.name}</Text>
                      {srv.description && (
                        <Text className="text-slate-400 text-xs mb-1" numberOfLines={2}>
                          {srv.description}
                        </Text>
                      )}
                      <View className="flex-row items-center gap-2">
                        <Text className="text-cyan-400 font-bold text-sm">
                          {formatRupiah(srv.price)}
                        </Text>
                        <Text className="text-slate-500 text-xs">({srv.duration} mnt)</Text>
                      </View>
                    </View>
                    <View
                      className={`w-6 h-6 rounded-md items-center justify-center border ${
                        isSelected ? "bg-cyan-400 border-cyan-400" : "border-slate-700 bg-slate-800"
                      }`}
                    >
                      {isSelected && <Check size={14} color="#030611" />}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}

          {/* Subtotal ringkasan */}
          {selectedServices.length > 0 && (
            <View className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 mb-4 flex-row justify-between items-center">
              <View>
                <Text className="text-slate-400 text-xs">Total Estimasi ({totalDuration} mnt)</Text>
                <Text className="text-cyan-400 font-bold text-base">{formatRupiah(totalAmount)}</Text>
              </View>
            </View>
          )}

          <View className="flex-row gap-2">
            <PrimaryButton
              title="Kembali"
              variant="secondary"
              onPress={() => setStep(2)}
              className="flex-1"
            />
            <PrimaryButton
              title="Lanjut Bayar"
              onPress={() => setStep(4)}
              disabled={selectedServices.length === 0}
              className="flex-1"
            />
          </View>
        </GradientCard>
      )}

      {/* STEP 4: DATA DIRI & PEMBAYARAN */}
      {step === 4 && (
        <GradientCard className="p-5">
          <View className="flex-row items-center mb-4">
            <CreditCard size={20} color="#22D3EE" />
            <Text className="text-white font-bold text-base ml-2">Konfirmasi & Pembayaran</Text>
          </View>

          {/* Ringkasan Booking */}
          <View className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 mb-4">
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-slate-400 text-xs">Capster:</Text>
              <Text className="text-slate-200 text-xs font-semibold">{selectedBarber?.name}</Text>
            </View>
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-slate-400 text-xs">Jadwal:</Text>
              <Text className="text-slate-200 text-xs font-semibold">
                {selectedDate} @ {selectedTime}
              </Text>
            </View>
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-slate-400 text-xs">Total Biaya:</Text>
              <Text className="text-cyan-400 text-sm font-bold">{formatRupiah(totalAmount)}</Text>
            </View>
          </View>

          {/* Input Data Diri */}
          <FloatingInput
            label="Nama Lengkap"
            value={customerName}
            onChangeText={setCustomerName}
            className="mb-3"
          />
          <FloatingInput
            label="No. WhatsApp (Aktif)"
            value={customerWhatsapp}
            onChangeText={setCustomerWhatsapp}
            keyboardType="phone-pad"
            className="mb-3"
          />
          <FloatingInput
            label="Email (Opsional)"
            value={customerEmail}
            onChangeText={setCustomerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="mb-4"
          />

          {/* Pilihan Metode Bayar */}
          <Text className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">
            Metode Pembayaran
          </Text>
          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity
              onPress={() => setPaymentMethod("QRIS")}
              className={`flex-1 p-3 rounded-xl border items-center ${
                paymentMethod === "QRIS"
                  ? "bg-blue-900/50 border-cyan-400"
                  : "bg-slate-900/60 border-slate-800"
              }`}
            >
              <Text className={`font-semibold text-xs ${paymentMethod === "QRIS" ? "text-cyan-300" : "text-slate-400"}`}>
                QRIS (Transfer)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPaymentMethod("CASH")}
              className={`flex-1 p-3 rounded-xl border items-center ${
                paymentMethod === "CASH"
                  ? "bg-blue-900/50 border-cyan-400"
                  : "bg-slate-900/60 border-slate-800"
              }`}
            >
              <Text className={`font-semibold text-xs ${paymentMethod === "CASH" ? "text-cyan-300" : "text-slate-400"}`}>
                Tunai di Kasir
              </Text>
            </TouchableOpacity>
          </View>

          {/* QRIS Upload Box */}
          {paymentMethod === "QRIS" && (
            <View className="bg-slate-900/90 p-4 rounded-xl border border-cyan-500/30 mb-4 items-center">
              <Text className="text-white text-xs font-bold mb-2">Scan QRIS BarberSip</Text>
              <Image
                source={require("../../../assets/qris-sample.png")}
                className="w-40 h-40 rounded-lg mb-3"
                resizeMode="contain"
              />
              <Text className="text-slate-400 text-[11px] text-center mb-3">
                Transfer tepat sebesar {formatRupiah(totalAmount)} lalu upload bukti screenshot.
              </Text>

              <TouchableOpacity
                onPress={pickImage}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600/30 border border-blue-500/50 flex-row items-center justify-center gap-2"
              >
                <Upload size={16} color="#22D3EE" />
                <Text className="text-cyan-300 text-xs font-semibold">
                  {paymentProofUri ? "Ganti Bukti Transfer" : "Upload Bukti Transfer"}
                </Text>
              </TouchableOpacity>
              {paymentProofUri && (
                <Text className="text-emerald-400 text-[11px] mt-1.5">✓ Bukti siap dikirim</Text>
              )}
            </View>
          )}

          <View className="flex-row gap-2">
            <PrimaryButton
              title="Kembali"
              variant="secondary"
              onPress={() => setStep(3)}
              className="flex-1"
            />
            <PrimaryButton
              title="Selesaikan Booking"
              onPress={handleSubmit}
              loading={submitting}
              className="flex-1"
            />
          </View>
        </GradientCard>
      )}
    </View>
  )
}

