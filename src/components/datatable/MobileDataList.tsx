import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Pagination } from './Pagination';

interface MobileDataListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  loading?: boolean;
  emptyMessage?: string;
  pageIndex?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  style?: ViewStyle;
}

export function MobileDataList<T>({
  data,
  renderItem,
  keyExtractor,
  loading = false,
  emptyMessage = 'Tidak ada data ditemukan',
  pageIndex,
  totalPages,
  onPageChange,
  style,
}: MobileDataListProps<T>) {
  if (loading) {
    return (
      <View style={[styles.centerBox, style]}>
        <ActivityIndicator color="#125AB8" size="large" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={[styles.centerBox, style]}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {data.map((item, index) => {
        const key = keyExtractor ? keyExtractor(item, index) : String(index);
        return <View key={key}>{renderItem(item, index)}</View>;
      })}

      {pageIndex !== undefined &&
      totalPages !== undefined &&
      onPageChange ? (
        <Pagination
          pageIndex={pageIndex}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  centerBox: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 10,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
});

