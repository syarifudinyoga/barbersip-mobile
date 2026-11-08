import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface StatusBadgeProps {
  status: string;
  label?: string;
  style?: ViewStyle;
}

export function StatusBadge({ status, label, style }: StatusBadgeProps) {
  const norm = String(status || '').toUpperCase();

  const getStyle = () => {
    if (
      ['CONFIRMED', 'CONFIRM', 'PAID', 'APPROVED', 'VERIFIED', 'SELESAI', 'AKTIF', 'PRESENT'].includes(
        norm
      ) ||
      norm === '1'
    ) {
      return {
        bg: 'rgba(16, 185, 129, 0.15)',
        text: '#34D399',
        border: 'rgba(52, 211, 153, 0.3)',
      };
    }

    if (
      ['WAITING', 'WAITING_VERIFICATION', 'PENDING', 'TERLAMBAT', 'MENUNGGU'].includes(norm) ||
      norm === '0'
    ) {
      return {
        bg: 'rgba(245, 158, 11, 0.15)',
        text: '#FBBF24',
        border: 'rgba(251, 191, 36, 0.3)',
      };
    }

    if (
      ['REJECTED', 'CANCELLED', 'DITOLAK', 'EXPIRED', 'NOT VERIFIED', 'ABSENT'].includes(norm) ||
      norm === '2'
    ) {
      return {
        bg: 'rgba(239, 68, 68, 0.15)',
        text: '#F87171',
        border: 'rgba(248, 113, 113, 0.3)',
      };
    }

    if (norm === 'MEMBER') {
      return {
        bg: 'rgba(59, 130, 246, 0.15)',
        text: '#60A5FA',
        border: 'rgba(96, 165, 250, 0.3)',
      };
    }

    return {
      bg: 'rgba(255, 255, 255, 0.08)',
      text: '#9CA3AF',
      border: 'rgba(255, 255, 255, 0.12)',
    };
  };

  const currentStyle = getStyle();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: currentStyle.bg,
          borderColor: currentStyle.border,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: currentStyle.text }]}>
        {label || status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

