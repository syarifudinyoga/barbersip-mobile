import React from "react"
import { View, ScrollView } from "react-native"
import { PageHeader } from "../../src/components/layout/PageHeader"
import { ProductCatalogSection } from "../../src/components/home/ProductCatalogSection"

export default function MemberProductsScreen() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      <PageHeader
        title="Toko Produk Grooming"
        subtitle="Dapatkan harga spesial eksklusif untuk member BarberSip"
      />
      <ProductCatalogSection />
    </ScrollView>
  )
}

