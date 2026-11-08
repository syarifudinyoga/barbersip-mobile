import React from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { Search } from 'lucide-react-native';

interface FilterBarProps {
  search?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  rightContent?: React.ReactNode;
  style?: ViewStyle;
}

export function FilterBar({
  search = '',
  onSearchChange,
  searchPlaceholder = 'Cari...',
  rightContent,
  style,
}: FilterBarProps) {
  return (
    <View style={[styles.container, style]}>
      {onSearchChange ? (
        <View style={styles.searchWrapper}>
          <Search size={16} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            value={search}
            onChangeText={onSearchChange}
            placeholder={searchPlaceholder}
            placeholderTextColor="#6B7280"
            style={styles.searchInput}
          />
        </View>
      ) : null}
      {rightContent ? <View style={styles.rightContent}>{rightContent}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  searchWrapper: {
    flex: 1,
    minWidth: 200,
    height: 42,
    borderRadius: 999,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

