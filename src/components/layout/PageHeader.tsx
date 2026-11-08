import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

export interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rightContent?: React.ReactNode;
  style?: ViewStyle;
}

export function PageHeader({
  title,
  description,
  subtitle,
  icon,
  rightContent,
  style,
}: PageHeaderProps) {
  const displayText = subtitle || description;
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftRow}>
        {icon ? <View style={styles.iconBox}>{icon}</View> : null}
        <View style={styles.titleColumn}>
          <Text style={styles.title}>{title}</Text>
          {displayText ? (
            <Text style={styles.description}>{displayText}</Text>
          ) : null}
        </View>
      </View>
      {rightContent ? <View style={styles.rightContent}>{rightContent}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(18, 90, 184, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 16,
  },
  rightContent: {
    marginLeft: 12,
  },
});
