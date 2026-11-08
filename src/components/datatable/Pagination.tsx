import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface PaginationProps {
  pageIndex: number;
  totalPages: number;
  onPageChange: (index: number) => void;
}

export function Pagination({
  pageIndex,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.arrowBtn, pageIndex === 0 && styles.btnDisabled]}
        disabled={pageIndex === 0}
        onPress={() => onPageChange(pageIndex - 1)}
      >
        <ChevronLeft size={16} color={pageIndex === 0 ? '#4B5563' : '#FFFFFF'} />
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.pageText}>
          Halaman <Text style={styles.highlight}>{pageIndex + 1}</Text> dari{' '}
          <Text style={styles.highlight}>{totalPages}</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.arrowBtn,
          pageIndex + 1 >= totalPages && styles.btnDisabled,
        ]}
        disabled={pageIndex + 1 >= totalPages}
        onPress={() => onPageChange(pageIndex + 1)}
      >
        <ChevronRight
          size={16}
          color={pageIndex + 1 >= totalPages ? '#4B5563' : '#FFFFFF'}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingVertical: 8,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  infoBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  pageText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  highlight: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

