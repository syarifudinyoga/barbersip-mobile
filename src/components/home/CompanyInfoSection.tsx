import React, { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native"
import {
  Clock,
  MapPin,
  Phone,
  Instagram,
  MessageSquare,
  Send,
  Star,
} from "lucide-react-native"
import { GradientCard } from "../ui/GradientCard"
import { GlassCard } from "../ui/GlassCard"
import { FloatingInput } from "../ui/FloatingInput"
import { PrimaryButton } from "../ui/PrimaryButton"
import { useAppSettings } from "../../hooks/useAppSettings"
import { apiFetch } from "../../api/client"

export function CompanyInfoSection() {
  const { settings } = useAppSettings()
  const [feedbackName, setFeedbackName] = useState("")
  const [feedbackComment, setFeedbackComment] = useState("")
  const [rating, setRating] = useState(5)
  const [sending, setSending] = useState(false)

  const handleSendFeedback = async () => {
    if (!feedbackName.trim() || !feedbackComment.trim()) {
      Alert.alert("Perhatian", "Silakan isi nama dan ulasan kamu.")
      return
    }

    try {
      setSending(true)
      await apiFetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          name: feedbackName,
          comment: feedbackComment,
          rating,
        }),
      })
      Alert.alert("Terima Kasih!", "Ulasan kamu telah kami terima.")
      setFeedbackName("")
      setFeedbackComment("")
      setRating(5)
    } catch (err: any) {
      Alert.alert("Info", "Terima kasih atas masukannya!")
      setFeedbackName("")
      setFeedbackComment("")
    } finally {
      setSending(false)
    }
  }

  const openWhatsApp = () => {
    if (settings?.call_center_whatsapp) {
      Linking.openURL(`https://wa.me/${settings.call_center_whatsapp}`)
    }
  }

  return (
    <View className="mb-8">
      {/* INFO OUTLET */}
      <GradientCard className="p-5 mb-5">
        <Text className="text-white font-bold text-base mb-3">Tentang BarberSip</Text>
        <Text className="text-slate-400 text-xs leading-relaxed mb-4">
          Barbershop modern dengan sentuhan cyber glassmorphism dan layanan premium.
          Capster profesional kami siap memberikan potongan terbaik untuk gayamu.
        </Text>

        <View className="space-y-3">
          <View className="flex-row items-center">
            <Clock size={16} color="#22D3EE" />
            <Text className="text-slate-300 text-xs ml-2.5">
              Setiap Hari: {settings?.company_opening_hours || "10:00 - 21:00 WIB"}
            </Text>
          </View>

          <View className="flex-row items-start mt-2">
            <MapPin size={16} color="#22D3EE" className="mt-0.5" />
            <Text className="text-slate-300 text-xs ml-2.5 flex-1">
              {settings?.company_address || "Jl. Gatot Subroto No. 88, Jakarta Selatan"}
            </Text>
          </View>

          {settings?.call_center_whatsapp && (
            <TouchableOpacity onPress={openWhatsApp} className="flex-row items-center mt-2">
              <Phone size={16} color="#34D399" />
              <Text className="text-emerald-400 text-xs ml-2.5 font-semibold">
                WhatsApp: +{settings.call_center_whatsapp}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </GradientCard>

      {/* FEEDBACK FORM */}
      <GlassCard className="p-5">
        <View className="flex-row items-center mb-2">
          <MessageSquare size={18} color="#22D3EE" />
          <Text className="text-white font-bold text-sm ml-2">Kritik & Saran</Text>
        </View>
        <Text className="text-slate-400 text-xs mb-3">
          Bantu kami meningkatkan kualitas layanan BarberSip.
        </Text>

        {/* Rating Stars */}
        <View className="flex-row items-center gap-2 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Star
                size={22}
                color={star <= rating ? "#FBBF24" : "#475569"}
                fill={star <= rating ? "#FBBF24" : "transparent"}
              />
            </TouchableOpacity>
          ))}
        </View>

        <FloatingInput
          label="Nama Anda"
          value={feedbackName}
          onChangeText={setFeedbackName}
          className="mb-2.5"
        />
        <FloatingInput
          label="Pesan / Ulasan Anda"
          value={feedbackComment}
          onChangeText={setFeedbackComment}
          multiline
          numberOfLines={3}
          className="mb-3"
        />

        <PrimaryButton
          title="Kirim Ulasan"
          onPress={handleSendFeedback}
          loading={sending}
        />
      </GlassCard>
    </View>
  )
}

