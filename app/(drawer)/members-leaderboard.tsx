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
  Trophy,
  Crown,
  ShoppingCart,
  Star,
  Calendar,
  User,
  RefreshCw,
  Sparkles,
} from "lucide-react-native"
import { PageHeader } from "../../src/components/layout/PageHeader"
import { GradientCard } from "../../src/components/ui/GradientCard"
import { GlassCard } from "../../src/components/ui/GlassCard"
import { apiFetch } from "../../src/api/client"
import { formatRupiah } from "../../src/lib/format"
import { subscribeToBarbersipSocket } from "../../src/lib/socket-client"

type RankingTab = "spenders" | "points" | "frequent"

interface LeaderboardMember {
  id: string
  name: string
  profile_image_url?: string | null
  total_spent?: number
  points?: number
  total_transactions?: number
}

interface LeaderboardData {
  year?: number
  activeMembers?: number
  topSpenders: LeaderboardMember[]
  topPoints: LeaderboardMember[]
  mostFrequent: LeaderboardMember[]
}

export default function MemberLeaderboardScreen() {
  const [tab, setTab] = useState<RankingTab>("spenders")
  const [data, setData] = useState<LeaderboardData>({
    topSpenders: [],
    topPoints: [],
    mostFrequent: [],
  })
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<LeaderboardData>("/api/members/leaderboard")
      if (res) {
        setData({
          topSpenders: res.topSpenders || [],
          topPoints: res.topPoints || [],
          mostFrequent: res.mostFrequent || [],
        })
      }
    } catch (err) {
      console.warn("Failed fetching leaderboard:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()

    const unsubscribe = subscribeToBarbersipSocket((event) => {
      if (
        event.type === "member_updated" ||
        event.type === "point_updated" ||
        event.type === "booking_status_updated"
      ) {
        fetchLeaderboard()
      }
    })

    return () => unsubscribe()
  }, [])

  const currentList =
    tab === "spenders"
      ? data.topSpenders
      : tab === "points"
      ? data.topPoints
      : data.mostFrequent

  const renderValue = (m: LeaderboardMember) => {
    if (tab === "spenders") return formatRupiah(m.total_spent || 0)
    if (tab === "points") return `${(m.points || 0).toLocaleString("id-ID")} Poin`
    return `${m.total_transactions || 0} Kali`
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      <PageHeader
        title="Leaderboard Member"
        subtitle="Peringkat member teratas BarberSip dengan berbagai keistimewaan eksklusif"
      />

      {/* Hero Podium 1, 2, 3 Card */}
      {currentList.length >= 3 && (
        <GradientCard className="p-5 mb-5 items-center">
          <View className="flex-row items-center mb-3">
            <Trophy size={20} color="#FBBF24" />
            <Text className="text-amber-300 font-extrabold text-sm ml-2">Top 3 Member Teratas</Text>
          </View>

          <View className="flex-row items-end justify-center w-full gap-3 pt-2">
            {/* Rank 2 */}
            <View className="items-center flex-1">
              <View className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-400 overflow-hidden items-center justify-center mb-1">
                {currentList[1]?.profile_image_url ? (
                  <Image source={{ uri: currentList[1].profile_image_url }} className="w-full h-full" />
                ) : (
                  <User size={24} color="#94A3B8" />
                )}
              </View>
              <View className="px-2 py-0.5 rounded-full bg-slate-400 mb-1">
                <Text className="text-black font-extrabold text-[10px]">#2</Text>
              </View>
              <Text className="text-white text-xs font-bold text-center" numberOfLines={1}>
                {currentList[1]?.name}
              </Text>
              <Text className="text-cyan-400 text-[10px] font-semibold">{renderValue(currentList[1])}</Text>
            </View>

            {/* Rank 1 */}
            <View className="items-center flex-1 mb-3">
              <Crown size={22} color="#FBBF24" className="mb-1" />
              <View className="w-18 h-18 rounded-full bg-slate-800 border-2 border-amber-400 overflow-hidden items-center justify-center mb-1 shadow-lg shadow-amber-500/30">
                {currentList[0]?.profile_image_url ? (
                  <Image source={{ uri: currentList[0].profile_image_url }} className="w-full h-full" />
                ) : (
                  <User size={30} color="#FBBF24" />
                )}
              </View>
              <View className="px-2.5 py-0.5 rounded-full bg-amber-400 mb-1">
                <Text className="text-black font-extrabold text-[10px]">#1 JUARA</Text>
              </View>
              <Text className="text-white text-xs font-bold text-center" numberOfLines={1}>
                {currentList[0]?.name}
              </Text>
              <Text className="text-amber-300 text-xs font-bold">{renderValue(currentList[0])}</Text>
            </View>

            {/* Rank 3 */}
            <View className="items-center flex-1">
              <View className="w-14 h-14 rounded-full bg-slate-800 border-2 border-amber-700 overflow-hidden items-center justify-center mb-1">
                {currentList[2]?.profile_image_url ? (
                  <Image source={{ uri: currentList[2].profile_image_url }} className="w-full h-full" />
                ) : (
                  <User size={24} color="#94A3B8" />
                )}
              </View>
              <View className="px-2 py-0.5 rounded-full bg-amber-700 mb-1">
                <Text className="text-white font-extrabold text-[10px]">#3</Text>
              </View>
              <Text className="text-white text-xs font-bold text-center" numberOfLines={1}>
                {currentList[2]?.name}
              </Text>
              <Text className="text-cyan-400 text-[10px] font-semibold">{renderValue(currentList[2])}</Text>
            </View>
          </View>
        </GradientCard>
      )}

      {/* 3 TABS SWITCHER */}
      <View className="flex-row bg-slate-900/90 p-1 rounded-2xl border border-slate-800 mb-4">
        {[
          { key: "spenders" as RankingTab, label: "Top Spender", icon: ShoppingCart },
          { key: "points" as RankingTab, label: "Top Poin", icon: Star },
          { key: "frequent" as RankingTab, label: "Tersering", icon: Calendar },
        ].map((t) => {
          const Icon = t.icon
          const isActive = tab === t.key
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
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

      {/* RANKING LIST */}
      {loading ? (
        <ActivityIndicator size="small" color="#22D3EE" className="py-8" />
      ) : currentList.length === 0 ? (
        <GlassCard className="p-6 items-center">
          <Text className="text-slate-400 text-xs">Belum ada data peringkat untuk kategori ini.</Text>
        </GlassCard>
      ) : (
        <View className="gap-2.5 mb-10">
          {currentList.map((m, idx) => (
            <GlassCard key={m.id || idx} className="p-3.5 border-slate-800 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-2">
                <Text className="text-slate-400 font-extrabold text-sm w-7">#{idx + 1}</Text>
                <View className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden items-center justify-center mr-3">
                  {m.profile_image_url ? (
                    <Image source={{ uri: m.profile_image_url }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <User size={18} color="#94A3B8" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-xs" numberOfLines={1}>{m.name}</Text>
                  <Text className="text-cyan-400 text-[11px] font-semibold">{renderValue(m)}</Text>
                </View>
              </View>
              {idx === 0 && <Crown size={18} color="#FBBF24" />}
            </GlassCard>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

