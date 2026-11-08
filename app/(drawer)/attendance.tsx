import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native"
import { CameraView, useCameraPermissions } from "expo-camera"
import * as Location from "expo-location"
import {
  MapPin,
  Camera as CameraIcon,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react-native"
import { PageHeader } from "../../src/components/layout/PageHeader"
import { GradientCard } from "../../src/components/ui/GradientCard"
import { GlassCard } from "../../src/components/ui/GlassCard"
import { PrimaryButton } from "../../src/components/ui/PrimaryButton"
import { useAuth } from "../../src/context/AuthContext"
import { useAppSettings } from "../../src/hooks/useAppSettings"
import { apiFetch, uploadFile } from "../../src/api/client"

interface TodayAttendance {
  id?: string
  check_in_at?: string
  check_in_photo_url?: string
  is_late?: boolean
  check_out_at?: string
  check_out_photo_url?: string
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000 // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function AttendanceScreen() {
  const { user } = useAuth()
  const { settings } = useAppSettings()

  const [permission, requestPermission] = useCameraPermissions()
  const [cameraFacing, setCameraFacing] = useState<"front" | "back">("front")
  const cameraRef = useRef<any>(null)

  const [attendance, setAttendance] = useState<TodayAttendance | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Location state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Photo selfie state
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null)

  // Current time
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      )
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch today attendance
  const fetchTodayAttendance = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<TodayAttendance>("/api/attendance/today")
      setAttendance(res)
    } catch (err) {
      console.warn("Failed fetching today attendance:", err)
    } finally {
      setLoading(false)
    }
  }

  // Request location & start watching
  useEffect(() => {
    fetchTodayAttendance()

    let sub: Location.LocationSubscription | null = null
    async function initLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setLocationError("Izin lokasi GPS ditolak. Aktifkan lokasi di pengaturan HP.")
        return
      }

      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (loc) => {
          setUserCoords({
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          })
          setAccuracy(loc.coords.accuracy)
        }
      )
    }

    initLocation()
    return () => {
      if (sub) sub.remove()
    }
  }, [])

  // Geofence calculation
  const outletLat = Number(settings?.attendance_latitude ?? -6.229728)
  const outletLng = Number(settings?.attendance_longitude ?? 106.807472)
  const allowedRadius = Number(settings?.attendance_radius_meters ?? 100)

  const distance = userCoords
    ? haversineDistance(userCoords.lat, userCoords.lng, outletLat, outletLng)
    : null

  const isWithinRadius = distance !== null && distance <= allowedRadius

  const isCheckedIn = Boolean(attendance?.check_in_at && !attendance?.check_out_at)
  const isCheckedOut = Boolean(attendance?.check_out_at)

  // Capture selfie
  const takeSelfie = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 })
        if (photo?.uri) {
          setCapturedPhotoUri(photo.uri)
        }
      } catch (err: any) {
        Alert.alert("Gagal Foto", err?.message || "Tidak dapat mengambil foto.")
      }
    }
  }

  // Submit Check In / Check Out
  const handleAttendance = async () => {
    if (!capturedPhotoUri) {
      Alert.alert("Perhatian", "Silakan ambil foto selfie terlebih dahulu.")
      return
    }
    if (!userCoords) {
      Alert.alert("Perhatian", "Menunggu deteksi lokasi GPS...")
      return
    }
    if (!isWithinRadius) {
      Alert.alert(
        "Di Luar Radius",
        `Kamu berada sejauh ${distance ? Math.round(distance) : "?"} meter dari outlet. Maksimal radius yang diizinkan adalah ${allowedRadius} meter.`
      )
      return
    }

    const action = isCheckedIn ? "check-out" : "check-in"

    try {
      setSubmitting(true)
      // Upload selfie photo
      const uploadRes = await uploadFile(capturedPhotoUri)

      const payload = {
        photo_url: uploadRes.url,
        latitude: userCoords.lat,
        longitude: userCoords.lng,
        accuracy: accuracy ?? 10,
      }

      await apiFetch(`/api/attendance/${action}`, {
        method: "POST",
        body: JSON.stringify(payload),
      })

      Alert.alert("Sukses", `Berhasil melakukan ${action === "check-in" ? "Check-In" : "Check-Out"}!`)
      setCapturedPhotoUri(null)
      fetchTodayAttendance()
    } catch (err: any) {
      Alert.alert("Gagal", err?.message || "Gagal mengirim data absensi.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      <PageHeader
        title="Absensi Kehadiran"
        subtitle="Verifikasi kehadiran harian dengan selfie kamera dan radius GPS outlet"
      />

      {/* Clock & Status Banner */}
      <GradientCard className="p-5 mb-5 items-center">
        <Text className="text-slate-400 text-xs mb-1">Waktu Server</Text>
        <Text className="text-cyan-400 font-black text-2xl tracking-widest mb-3">
          {currentTime || "--:--:-- WIB"}
        </Text>

        <View className="flex-row gap-2 w-full">
          <View className="flex-1 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 items-center">
            <Text className="text-slate-400 text-[10px] mb-0.5">Check In</Text>
            <Text className="text-emerald-400 font-bold text-xs">
              {attendance?.check_in_at ? attendance.check_in_at.split("T")[1]?.slice(0, 5) : "--:--"}
            </Text>
          </View>
          <View className="flex-1 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 items-center">
            <Text className="text-slate-400 text-[10px] mb-0.5">Check Out</Text>
            <Text className="text-cyan-400 font-bold text-xs">
              {attendance?.check_out_at ? attendance.check_out_at.split("T")[1]?.slice(0, 5) : "--:--"}
            </Text>
          </View>
        </View>
      </GradientCard>

      {/* Geofence Status */}
      <GlassCard className="p-4 mb-5 border-slate-800">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <MapPin size={18} color="#22D3EE" />
            <Text className="text-white font-bold text-xs ml-2">Status Lokasi GPS</Text>
          </View>
          {isWithinRadius ? (
            <View className="flex-row items-center bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40">
              <CheckCircle size={12} color="#34D399" />
              <Text className="text-emerald-300 text-[10px] font-bold ml-1">Dalam Radius</Text>
            </View>
          ) : (
            <View className="flex-row items-center bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/40">
              <XCircle size={12} color="#FB7185" />
              <Text className="text-rose-300 text-[10px] font-bold ml-1">Luar Radius</Text>
            </View>
          )}
        </View>

        <Text className="text-slate-300 text-xs">
          Jarak ke Outlet:{" "}
          <Text className="text-cyan-400 font-bold">
            {distance !== null ? `${Math.round(distance)} meter` : "Mencari GPS..."}
          </Text>{" "}
          (Maks: {allowedRadius}m)
        </Text>
        {locationError && <Text className="text-rose-400 text-[11px] mt-1">{locationError}</Text>}
      </GlassCard>

      {/* Camera / Photo Preview */}
      {!isCheckedOut && (
        <GradientCard className="p-4 mb-5 items-center">
          <Text className="text-white font-bold text-sm mb-3">
            {capturedPhotoUri
              ? "Preview Foto Selfie"
              : `Foto Selfie ${isCheckedIn ? "Check-Out" : "Check-In"}`}
          </Text>

          {capturedPhotoUri ? (
            <View className="w-64 h-64 rounded-2xl overflow-hidden border-2 border-cyan-400 mb-3">
              <Image source={{ uri: capturedPhotoUri }} className="w-full h-full" resizeMode="cover" />
            </View>
          ) : !permission ? (
            <ActivityIndicator size="small" color="#22D3EE" className="py-12" />
          ) : !permission.granted ? (
            <View className="py-8 items-center">
              <Text className="text-slate-300 text-xs mb-3 text-center">
                Izin kamera diperlukan untuk absensi selfie.
              </Text>
              <PrimaryButton title="Izinkan Kamera" onPress={requestPermission} />
            </View>
          ) : (
            <View className="w-64 h-64 rounded-2xl overflow-hidden border border-slate-700 mb-3 bg-black">
              <CameraView
                ref={cameraRef}
                facing={cameraFacing}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
          )}

          {/* Camera Buttons */}
          {capturedPhotoUri ? (
            <TouchableOpacity
              onPress={() => setCapturedPhotoUri(null)}
              className="py-2 px-4 rounded-xl bg-slate-800 border border-slate-700 flex-row items-center gap-1.5 mb-2"
            >
              <RotateCcw size={14} color="#E2E8F0" />
              <Text className="text-slate-200 text-xs font-semibold">Ambil Ulang Selfie</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setCameraFacing((prev) => (prev === "front" ? "back" : "front"))}
                className="p-3 rounded-full bg-slate-800 border border-slate-700"
              >
                <RotateCcw size={18} color="#94A3B8" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={takeSelfie}
                className="py-2.5 px-6 rounded-full bg-blue-600 border border-cyan-400 flex-row items-center gap-2 shadow-lg shadow-cyan-500/30"
              >
                <CameraIcon size={16} color="#FFFFFF" />
                <Text className="text-white font-bold text-xs">Jepret Selfie</Text>
              </TouchableOpacity>
            </View>
          )}
        </GradientCard>
      )}

      {/* Action Submit Button */}
      {isCheckedOut ? (
        <GlassCard className="p-5 items-center mb-10">
          <CheckCircle size={32} color="#10B981" className="mb-2" />
          <Text className="text-white font-bold text-sm text-center">Absensi Hari Ini Lengkap</Text>
          <Text className="text-slate-400 text-xs text-center mt-1">
            Kamu telah menyelesaikan Check-In dan Check-Out untuk hari ini.
          </Text>
        </GlassCard>
      ) : (
        <PrimaryButton
          title={isCheckedIn ? "Kirim Check-Out Kehadiran" : "Kirim Check-In Kehadiran"}
          onPress={handleAttendance}
          loading={submitting}
          disabled={!capturedPhotoUri || !isWithinRadius}
          className="mb-10"
        />
      )}
    </ScrollView>
  )
}

