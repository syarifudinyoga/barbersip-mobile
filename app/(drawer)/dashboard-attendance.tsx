import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import {
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
} from "lucide-react-native"
import { PageHeader } from "../../src/components/layout/PageHeader"
import { GlassCard } from "../../src/components/ui/GlassCard"
import { CustomModal } from "../../src/components/ui/CustomModal"
import { FloatingInput } from "../../src/components/ui/FloatingInput"
import { apiFetch } from "../../src/api/client"

interface SuperAttendanceItem {
  id: string
  barber_name: string
  attendance_date: string
  check_in_at: string
  check_in_photo_url?: string
  is_late: boolean
  check_out_at?: string | null
  check_out_photo_url?: string | null
}

export default function DashboardAttendanceScreen() {
  const [list, setList] = useState<SuperAttendanceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string } | null>(null)

  const todayStr = new Date().toISOString().split("T")[0]
  const [filterDate, setFilterDate] = useState(todayStr)

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<any[]>(`/api/attendance?date=${filterDate}`)
      setList(Array.isArray(res) ? res : [])
    } catch (err) {
      console.warn("Failed fetching attendance:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [filterDate])

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      <PageHeader
        title="Audit Absensi Capster"
        subtitle="Monitoring kehadiran seluruh capster, selfie check-in, dan keterlambatan"
      />

      <View className="mb-4">
        <FloatingInput
          label="Filter Tanggal (YYYY-MM-DD)"
          value={filterDate}
          onChangeText={setFilterDate}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#22D3EE" className="py-8" />
      ) : list.length === 0 ? (
        <GlassCard className="p-6 items-center">
          <Text className="text-slate-400 text-xs">Belum ada absensi untuk tanggal ini.</Text>
        </GlassCard>
      ) : (
        <View className="gap-3 mb-10">
          {list.map((item) => (
            <GlassCard key={item.id} className="p-4 border-slate-800">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white font-bold text-xs">{item.barber_name}</Text>
                {item.is_late ? (
                  <View className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40">
                    <Text className="text-rose-300 font-bold text-[10px]">Terlambat</Text>
                  </View>
                ) : (
                  <View className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                    <Text className="text-emerald-300 font-bold text-[10px]">Tepat Waktu</Text>
                  </View>
                )}
              </View>

              <View className="flex-row gap-2">
                <View className="flex-1 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <Text className="text-slate-400 text-[10px] mb-0.5">Check-In</Text>
                  <Text className="text-emerald-400 font-bold text-xs mb-1">
                    {item.check_in_at ? item.check_in_at.split("T")[1]?.slice(0, 5) : "--:--"}
                  </Text>
                  {item.check_in_photo_url && (
                    <TouchableOpacity
                      onPress={() => setSelectedPhoto({ url: item.check_in_photo_url!, title: `Selfie In: ${item.barber_name}` })}
                      className="flex-row items-center gap-1 mt-0.5"
                    >
                      <Eye size={12} color="#22D3EE" />
                      <Text className="text-cyan-400 text-[10px] font-semibold">Foto Selfie</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View className="flex-1 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <Text className="text-slate-400 text-[10px] mb-0.5">Check-Out</Text>
                  <Text className="text-cyan-400 font-bold text-xs mb-1">
                    {item.check_out_at ? item.check_out_at.split("T")[1]?.slice(0, 5) : "--:--"}
                  </Text>
                  {item.check_out_photo_url && (
                    <TouchableOpacity
                      onPress={() => setSelectedPhoto({ url: item.check_out_photo_url!, title: `Selfie Out: ${item.barber_name}` })}
                      className="flex-row items-center gap-1 mt-0.5"
                    >
                      <Eye size={12} color="#22D3EE" />
                      <Text className="text-cyan-400 text-[10px] font-semibold">Foto Selfie</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </GlassCard>
          ))}
        </View>
      )}

      {selectedPhoto && (
        <CustomModal
          visible={Boolean(selectedPhoto)}
          onClose={() => setSelectedPhoto(null)}
          title={selectedPhoto.title}
        >
          <View className="items-center">
            <Image
              source={{ uri: selectedPhoto.url }}
              className="w-72 h-72 rounded-2xl mb-4 border border-slate-700"
              resizeMode="cover"
            />
          </View>
        </CustomModal>
      )}
    </ScrollView>
  )
}

