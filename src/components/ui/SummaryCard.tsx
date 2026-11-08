import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'blue' | 'green' | 'yellow' | 'red';
  subtitle?: string;
  style?: ViewStyle;
}

export function SummaryCard({
  title,
  value,
  icon,
  variant = 'blue',
  subtitle,
  style,
}: SummaryCardProps) {
  const variantStyles = {
    blue: {
      valueColor: '#60A5FA',
      iconBg: 'rgba(59, 130, 246, 0.12)',
      iconBorder: 'rgba(59, 130, 246, 0.25)',
      lineColor: '#3B82F6',
    },
    green: {
      valueColor: '#34D399',
      iconBg: 'rgba(16, 185, 129, 0.12)',
      iconBorder: 'rgba(16, 185, 129, 0.25)',
      lineColor: '#10B981',
    },
    yellow: {
      valueColor: '#FBBF24',
      iconBg: 'rgba(245, 158, 11, 0.12)',
      iconBorder: 'rgba(245, 158, 11, 0.25)',
      lineColor: '#F59E0B',
    },
    red: {
      valueColor: '#F87171',
      iconBg: 'rgba(239, 68, 68, 0.12)',
      iconBorder: 'rgba(239, 68, 68, 0.25)',
      lineColor: '#EF4444',
    },
  }[variant];

  return (
    <View style={[styles.card, style]}>
      <View style={styles.contentRow}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.value, { color: variantStyles.valueColor }]}>
            {value}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: variantStyles.iconBg,
              borderColor: variantStyles.iconBorder,
            },
          ]}
        >
          {icon}
        </View>
      </View>
      {/* Accent line at bottom */}
      <View
        style={[
          styles.accentLine,
          { backgroundColor: variantStyles.lineColor },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 18,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.2,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 4,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 1.5,
    opacity: 0.4,
  },
});

