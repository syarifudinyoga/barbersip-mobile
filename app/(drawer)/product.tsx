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
import * as ImagePicker from "expo-image-picker"
import {
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Search,
} from "lucide-react-native"
import { PageHeader } from "../../src/components/layout/PageHeader"
import { GlassCard } from "../../src/components/ui/GlassCard"
import { PrimaryButton } from "../../src/components/ui/PrimaryButton"
import { FloatingInput } from "../../src/components/ui/FloatingInput"
import { CustomModal } from "../../src/components/ui/CustomModal"
import { apiFetch, uploadFile } from "../../src/api/client"
import { formatRupiah } from "../../src/lib/format"

interface ProductItem {
  id: string
  name: string
  description?: string
  price_guest: number
  price_member: number
  stock?: number
  image_url?: string | null
}

export default function ProductManagementScreen() {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Form Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [priceGuest, setPriceGuest] = useState("")
  const [priceMember, setPriceMember] = useState("")
  const [stock, setStock] = useState("10")
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<ProductItem[]>("/api/products")
      setProducts(Array.isArray(res) ? res : [])
    } catch (err) {
      console.warn("Failed fetching products:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleOpenAdd = () => {
    setEditingId(null)
    setName("")
    setDescription("")
    setPriceGuest("")
    setPriceMember("")
    setStock("10")
    setImageUri(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (p: ProductItem) => {
    setEditingId(p.id)
    setName(p.name)
    setDescription(p.description || "")
    setPriceGuest(String(p.price_guest))
    setPriceMember(String(p.price_member))
    setStock(String(p.stock ?? 10))
    setImageUri(p.image_url || null)
    setModalOpen(true)
  }

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!res.canceled && res.assets[0]?.uri) {
      setImageUri(res.assets[0].uri)
    }
  }

  const handleSave = async () => {
    if (!name.trim() || !priceGuest || !priceMember) {
      Alert.alert("Perhatian", "Nama dan harga produk wajib diisi.")
      return
    }

    try {
      setSaving(true)
      let uploadedUrl = imageUri

      if (imageUri && imageUri.startsWith("file://")) {
        const uploadRes = await uploadFile(imageUri)
        uploadedUrl = uploadRes.url
      }

      const payload = {
        name,
        description,
        price_guest: Number(priceGuest),
        price_member: Number(priceMember),
        stock: Number(stock || 0),
        image_url: uploadedUrl,
      }

      if (editingId) {
        await apiFetch(`/api/products/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
        Alert.alert("Sukses", "Produk berhasil diperbarui.")
      } else {
        await apiFetch("/api/products", {
          method: "POST",
          body: JSON.stringify(payload),
        })
        Alert.alert("Sukses", "Produk baru berhasil ditambahkan.")
      }

      setModalOpen(false)
      fetchProducts()
    } catch (err: any) {
      Alert.alert("Gagal", err?.message || "Gagal menyimpan produk.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (id: string) => {
    Alert.alert("Hapus Produk", "Apakah kamu yakin ingin menghapus produk ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await apiFetch(`/api/products/${id}`, { method: "DELETE" })
            Alert.alert("Sukses", "Produk telah dihapus.")
            fetchProducts()
          } catch (err: any) {
            Alert.alert("Gagal", err?.message || "Gagal menghapus produk.")
          }
        },
      },
    ])
  }

  const filtered = products.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      <PageHeader
        title="Katalog Produk"
        subtitle="Kelola produk grooming pria, stok gudang, dan harga guest vs member"
      />

      <View className="flex-row gap-2 mb-4">
        <View className="flex-1">
          <FloatingInput
            label="Cari nama produk..."
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
          <Text className="text-slate-400 text-xs">Belum ada produk terdaftar.</Text>
        </GlassCard>
      ) : (
        <View className="gap-3 mb-10">
          {filtered.map((p) => (
            <GlassCard key={p.id} className="p-4 border-slate-800 flex-row items-center justify-between">
              <View className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden items-center justify-center mr-3">
                {p.image_url ? (
                  <Image source={{ uri: p.image_url }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <ShoppingBag size={24} color="#64748B" />
                )}
              </View>

              <View className="flex-1 mr-2">
                <Text className="text-white font-bold text-xs mb-1" numberOfLines={1}>{p.name}</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-cyan-400 font-extrabold text-xs">{formatRupiah(p.price_guest)}</Text>
                  <Text className="text-emerald-400 text-[10px]">Mem: {formatRupiah(p.price_member)}</Text>
                </View>
                <Text className="text-slate-500 text-[10px] mt-0.5">Stok: {p.stock ?? 0}</Text>
              </View>

              <View className="flex-row items-center gap-1.5">
                <TouchableOpacity
                  onPress={() => handleOpenEdit(p)}
                  className="p-2 rounded-lg bg-slate-800 border border-slate-700"
                >
                  <Edit2 size={14} color="#38BDF8" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(p.id)}
                  className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30"
                >
                  <Trash2 size={14} color="#FB7185" />
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))}
        </View>
      )}

      {/* Modal Tambah/Edit Produk */}
      <CustomModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Produk" : "Tambah Produk Baru"}
      >
        <ScrollView className="max-h-96">
          <FloatingInput label="Nama Produk" value={name} onChangeText={setName} className="mb-2.5" />
          <FloatingInput label="Deskripsi" value={description} onChangeText={setDescription} multiline numberOfLines={2} className="mb-2.5" />
          <FloatingInput label="Harga Guest (Rp)" value={priceGuest} onChangeText={setPriceGuest} keyboardType="numeric" className="mb-2.5" />
          <FloatingInput label="Harga Member (Rp)" value={priceMember} onChangeText={setPriceMember} keyboardType="numeric" className="mb-2.5" />
          <FloatingInput label="Jumlah Stok" value={stock} onChangeText={setStock} keyboardType="numeric" className="mb-3" />

          {/* Upload Image Box */}
          <TouchableOpacity
            onPress={pickImage}
            className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 flex-row items-center justify-center gap-2 mb-4"
          >
            <Upload size={14} color="#22D3EE" />
            <Text className="text-cyan-300 text-xs font-semibold">
              {imageUri ? "Ganti Gambar Produk" : "Unggah Gambar Produk"}
            </Text>
          </TouchableOpacity>

          <PrimaryButton
            title="Simpan Produk"
            onPress={handleSave}
            loading={saving}
          />
        </ScrollView>
      </CustomModal>
    </ScrollView>
  )
}

