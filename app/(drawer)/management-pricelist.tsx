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
  Scissors,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Search,
} from "lucide-react-native"
import { PageHeader } from "../../src/components/layout/PageHeader"
import { GlassCard } from "../../src/components/ui/GlassCard"
import { FloatingInput } from "../../src/components/ui/FloatingInput"
import { CustomModal } from "../../src/components/ui/CustomModal"
import { PrimaryButton } from "../../src/components/ui/PrimaryButton"
import { apiFetch } from "../../src/api/client"
import { formatRupiah } from "../../src/lib/format"

interface ServiceItem {
  id: string
  name: string
  description?: string
  price: number
  duration: number
  service_group?: string
}

export default function ManagementPricelistScreen() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [duration, setDuration] = useState("30")
  const [serviceGroup, setServiceGroup] = useState("Haircut")
  const [saving, setSaving] = useState(false)

  const fetchServices = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<ServiceItem[]>("/api/pricelist")
      setServices(Array.isArray(res) ? res : [])
    } catch (err) {
      console.warn("Failed fetching pricelist:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleOpenAdd = () => {
    setEditingId(null)
    setName("")
    setDescription("")
    setPrice("")
    setDuration("30")
    setServiceGroup("Haircut")
    setModalOpen(true)
  }

  const handleOpenEdit = (s: ServiceItem) => {
    setEditingId(s.id)
    setName(s.name)
    setDescription(s.description || "")
    setPrice(String(s.price))
    setDuration(String(s.duration))
    setServiceGroup(s.service_group || "Haircut")
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!name.trim() || !price) {
      Alert.alert("Perhatian", "Nama layanan dan harga wajib diisi.")
      return
    }

    try {
      setSaving(true)
      const payload = {
        name,
        description,
        price: Number(price),
        duration: Number(duration || 30),
        service_group: serviceGroup,
      }

      if (editingId) {
        await apiFetch(`/api/pricelist/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
        Alert.alert("Sukses", "Layanan berhasil diperbarui.")
      } else {
        await apiFetch("/api/pricelist", {
          method: "POST",
          body: JSON.stringify(payload),
        })
        Alert.alert("Sukses", "Layanan baru berhasil ditambahkan.")
      }

      setModalOpen(false)
      fetchServices()
    } catch (err: any) {
      Alert.alert("Gagal", err?.message || "Gagal menyimpan layanan.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (id: string) => {
    Alert.alert("Hapus Layanan", "Apakah kamu yakin ingin menghapus layanan ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await apiFetch(`/api/pricelist/${id}`, { method: "DELETE" })
            Alert.alert("Sukses", "Layanan telah dihapus.")
            fetchServices()
          } catch (err: any) {
            Alert.alert("Gagal", err?.message || "Gagal menghapus layanan.")
          }
        },
      },
    ])
  }

  const filtered = services.filter((s) =>
    (s.name || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      <PageHeader
        title="Daftar Layanan & Harga"
        subtitle="Kelola paket treatment cukur, durasi pengerjaan, dan tarif harga"
      />

      <View className="flex-row gap-2 mb-4">
        <View className="flex-1">
          <FloatingInput
            label="Cari nama layanan..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          onPress={handleOpenAdd}
          className="px-4 rounded-xl bg-blue-600 border border-cyan-400 items-center justify-center shadow-lg shadow-cyan-500/20"
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#22D3EE" className="py-8" />
      ) : filtered.length === 0 ? (
        <GlassCard className="p-6 items-center">
          <Text className="text-slate-400 text-xs">Belum ada layanan terdaftar.</Text>
        </GlassCard>
      ) : (
        <View className="gap-3 mb-10">
          {filtered.map((s) => (
            <GlassCard key={s.id} className="p-4 border-slate-800 flex-row items-center justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-white font-bold text-xs mb-0.5">{s.name}</Text>
                {s.description && (
                  <Text className="text-slate-400 text-[10px] mb-1" numberOfLines={1}>{s.description}</Text>
                )}
                <View className="flex-row items-center gap-2">
                  <Text className="text-cyan-400 font-extrabold text-xs">{formatRupiah(s.price)}</Text>
                  <Text className="text-slate-500 text-[10px]">({s.duration} mnt)</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-1.5">
                <TouchableOpacity
                  onPress={() => handleOpenEdit(s)}
                  className="p-2 rounded-lg bg-slate-800 border border-slate-700"
                >
                  <Edit2 size={14} color="#38BDF8" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(s.id)}
                  className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30"
                >
                  <Trash2 size={14} color="#FB7185" />
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))}
        </View>
      )}

      {/* Modal Tambah/Edit */}
      <CustomModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Layanan" : "Tambah Layanan Baru"}
      >
        <ScrollView className="max-h-96">
          <FloatingInput label="Nama Layanan" value={name} onChangeText={setName} className="mb-2.5" />
          <FloatingInput label="Deskripsi" value={description} onChangeText={setDescription} multiline numberOfLines={2} className="mb-2.5" />
          <FloatingInput label="Tarif Harga (Rp)" value={price} onChangeText={setPrice} keyboardType="numeric" className="mb-2.5" />
          <FloatingInput label="Durasi Treatment (Menit)" value={duration} onChangeText={setDuration} keyboardType="numeric" className="mb-2.5" />
          <FloatingInput label="Kategori Layanan" value={serviceGroup} onChangeText={setServiceGroup} className="mb-4" />

          <PrimaryButton
            title="Simpan Layanan"
            onPress={handleSave}
            loading={saving}
          />
        </ScrollView>
      </CustomModal>
    </ScrollView>
  )
}

