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
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  CreditCard,
  Upload,
  Check,
} from "lucide-react-native"
import { GradientCard } from "../ui/GradientCard"
import { GlassCard } from "../ui/GlassCard"
import { PrimaryButton } from "../ui/PrimaryButton"
import { FloatingInput } from "../ui/FloatingInput"
import { CustomModal } from "../ui/CustomModal"
import { apiFetch, uploadFile } from "../../api/client"
import { formatRupiah } from "../../lib/format"
import { useAuth } from "../../context/AuthContext"

interface Product {
  id: string
  name: string
  description?: string
  image_url?: string | null
  price_guest: number | string
  price_member: number | string
  stock?: number
}

interface CartItem {
  product: Product
  quantity: number
}

export function ProductCatalogSection() {
  const { user } = useAuth()
  const isMember = user?.role === "member"

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartModalOpen, setCartModalOpen] = useState(false)
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)

  // Checkout inputs
  const [customerName, setCustomerName] = useState("")
  const [customerWhatsapp, setCustomerWhatsapp] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [paymentProofUri, setPaymentProofUri] = useState<string | null>(null)
  const [submittingOrder, setSubmittingOrder] = useState(false)
  const [orderSuccessCode, setOrderSuccessCode] = useState<string | null>(null)

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        const data = await apiFetch<Product[]>("/api/products")
        setProducts(data || [])
      } catch (err) {
        console.warn("Failed to load products:", err)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta
            return nextQty > 0 ? { ...item, quantity: nextQty } : null
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalCartAmount = cart.reduce((sum, item) => {
    const price = isMember ? Number(item.product.price_member) : Number(item.product.price_guest)
    return sum + price * item.quantity
  }, 0)

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

  const handleCheckout = async () => {
    if (!customerName.trim() || !customerWhatsapp.trim()) {
      Alert.alert("Perhatian", "Nama dan No. WhatsApp wajib diisi.")
      return
    }
    if (!paymentProofUri) {
      Alert.alert("Perhatian", "Silakan upload bukti transfer QRIS.")
      return
    }

    try {
      setSubmittingOrder(true)
      const uploadRes = await uploadFile(paymentProofUri)

      const payload = {
        customer_name: customerName,
        customer_whatsapp: customerWhatsapp,
        customer_email: customerEmail || undefined,
        delivery_address: deliveryAddress || undefined,
        payment_proof_url: uploadRes.url,
        items: cart.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
      }

      const res = await apiFetch<any>("/api/products/order", {
        method: "POST",
        body: JSON.stringify(payload),
      })

      const code = res.order_code || res.code || "ODR-" + Date.now().toString().slice(-6)
      setOrderSuccessCode(code)
      setCart([])
      setCheckoutModalOpen(false)
    } catch (err: any) {
      Alert.alert("Gagal Pesan", err?.message || "Terjadi kendala saat checkout pesanan.")
    } finally {
      setSubmittingOrder(false)
    }
  }

  return (
    <View className="mb-8">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <ShoppingBag size={20} color="#22D3EE" />
          <Text className="text-white font-bold text-base ml-2">Produk Perawatan Pria</Text>
        </View>

        {totalCartItems > 0 && (
          <TouchableOpacity
            onPress={() => setCartModalOpen(true)}
            className="flex-row items-center bg-blue-600/30 border border-cyan-400 px-3 py-1.5 rounded-full"
          >
            <ShoppingCart size={16} color="#22D3EE" />
            <Text className="text-cyan-300 font-bold text-xs ml-1.5">{totalCartItems}</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#22D3EE" className="py-8" />
      ) : products.length === 0 ? (
        <Text className="text-slate-400 text-xs text-center py-6">Belum ada produk tersedia.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
          {products.map((p) => {
            const price = isMember ? Number(p.price_member) : Number(p.price_guest)
            return (
              <GlassCard key={p.id} className="w-52 p-3 mr-3 rounded-2xl border-slate-800">
                <View className="w-full h-36 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden mb-2.5 items-center justify-center">
                  {p.image_url ? (
                    <Image source={{ uri: p.image_url }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <ShoppingBag size={32} color="#475569" />
                  )}
                </View>

                <Text className="text-white font-bold text-sm mb-1" numberOfLines={1}>
                  {p.name}
                </Text>
                <Text className="text-cyan-400 font-extrabold text-sm mb-3">
                  {formatRupiah(price)}
                </Text>

                <PrimaryButton
                  title="Tambah"
                  onPress={() => addToCart(p)}
                  className="py-2"
                />
              </GlassCard>
            )
          })}
        </ScrollView>
      )}

      {/* MODAL KERANJANG */}
      <CustomModal
        visible={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        title="Keranjang Belanja"
      >
        {cart.length === 0 ? (
          <Text className="text-slate-400 text-center py-6 text-xs">Keranjang belanja kosong.</Text>
        ) : (
          <View>
            <ScrollView className="max-h-80 mb-4">
              {cart.map((item) => {
                const price = isMember ? Number(item.product.price_member) : Number(item.product.price_guest)
                return (
                  <View
                    key={item.product.id}
                    className="flex-row items-center justify-between py-2.5 border-b border-slate-800"
                  >
                    <View className="flex-1 mr-2">
                      <Text className="text-white font-semibold text-xs" numberOfLines={1}>
                        {item.product.name}
                      </Text>
                      <Text className="text-cyan-400 text-xs font-bold">{formatRupiah(price)}</Text>
                    </View>

                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.product.id, -1)}
                        className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 items-center justify-center"
                      >
                        <Minus size={12} color="#E2E8F0" />
                      </TouchableOpacity>
                      <Text className="text-white font-bold text-xs w-4 text-center">
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.product.id, 1)}
                        className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 items-center justify-center"
                      >
                        <Plus size={12} color="#E2E8F0" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeFromCart(item.product.id)}
                        className="p-1.5 ml-1"
                      >
                        <Trash2 size={16} color="#FB7185" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              })}
            </ScrollView>

            <View className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 mb-4 flex-row justify-between items-center">
              <Text className="text-slate-400 text-xs font-medium">Total Pembayaran:</Text>
              <Text className="text-cyan-400 font-extrabold text-base">
                {formatRupiah(totalCartAmount)}
              </Text>
            </View>

            <PrimaryButton
              title="Checkout Sekarang"
              onPress={() => {
                setCartModalOpen(false)
                setCheckoutModalOpen(true)
              }}
            />
          </View>
        )}
      </CustomModal>

      {/* MODAL CHECKOUT */}
      <CustomModal
        visible={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title="Checkout Pesanan Produk"
      >
        <ScrollView className="max-h-[460px]">
          <View className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 mb-3 flex-row justify-between">
            <Text className="text-slate-400 text-xs">Total ({totalCartItems} item):</Text>
            <Text className="text-cyan-400 text-sm font-bold">{formatRupiah(totalCartAmount)}</Text>
          </View>

          <FloatingInput
            label="Nama Pemesan"
            value={customerName}
            onChangeText={setCustomerName}
            className="mb-2.5"
          />
          <FloatingInput
            label="No. WhatsApp"
            value={customerWhatsapp}
            onChangeText={setCustomerWhatsapp}
            keyboardType="phone-pad"
            className="mb-2.5"
          />
          <FloatingInput
            label="Email (Opsional)"
            value={customerEmail}
            onChangeText={setCustomerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="mb-2.5"
          />
          <FloatingInput
            label="Alamat Pengiriman (Bila dikirim)"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
            numberOfLines={2}
            className="mb-3"
          />

          {/* QRIS Transfer Box */}
          <View className="bg-slate-900/90 p-3.5 rounded-xl border border-cyan-500/30 items-center mb-4">
            <Text className="text-white text-xs font-bold mb-1.5">Scan QRIS Pembayaran</Text>
            <Image
              source={require("../../../assets/qris-sample.png")}
              className="w-32 h-32 rounded-lg mb-2"
              resizeMode="contain"
            />
            <Text className="text-slate-400 text-[11px] text-center mb-2.5">
              Transfer tepat sebesar {formatRupiah(totalCartAmount)} lalu unggah struk.
            </Text>

            <TouchableOpacity
              onPress={pickImage}
              className="w-full py-2 px-3 rounded-lg bg-blue-600/30 border border-blue-500/50 flex-row items-center justify-center gap-2"
            >
              <Upload size={14} color="#22D3EE" />
              <Text className="text-cyan-300 text-xs font-semibold">
                {paymentProofUri ? "Ganti Bukti Transfer" : "Upload Bukti Transfer"}
              </Text>
            </TouchableOpacity>
            {paymentProofUri && (
              <Text className="text-emerald-400 text-[10px] mt-1">✓ Bukti siap dikirim</Text>
            )}
          </View>

          <PrimaryButton
            title="Kirim Pesanan"
            onPress={handleCheckout}
            loading={submittingOrder}
            className="mb-2"
          />
        </ScrollView>
      </CustomModal>

      {/* Modal Success */}
      {orderSuccessCode && (
        <CustomModal
          visible={Boolean(orderSuccessCode)}
          onClose={() => setOrderSuccessCode(null)}
          title="Pesanan Berhasil!"
        >
          <View className="items-center py-4">
            <View className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 items-center justify-center mb-3">
              <Check size={28} color="#10B981" />
            </View>
            <Text className="text-white text-base font-bold mb-1 text-center">Pesanan Kamu Diterima</Text>
            <Text className="text-slate-400 text-xs text-center mb-4">
              Kode Pesanan: <Text className="text-cyan-400 font-bold">{orderSuccessCode}</Text>
            </Text>
            <PrimaryButton
              title="Tutup"
              onPress={() => setOrderSuccessCode(null)}
              className="w-full"
            />
          </View>
        </CustomModal>
      )}
    </View>
  )
}

