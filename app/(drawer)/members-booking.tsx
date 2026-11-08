import React from "react"
import { View, ScrollView } from "react-native"
import { PageHeader } from "../../src/components/layout/PageHeader"
import { BookingSection } from "../../src/components/home/BookingSection"

export default function MemberBookingScreen() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} className="py-3">
      <PageHeader
        title="Booking Layanan Member"
        subtitle="Reservasi mudah dan nikmati cashback poin spesial member"
      />
      <BookingSection />
    </ScrollView>
  )
}

