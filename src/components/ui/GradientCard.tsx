import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  className?: string;
  cornerHighlights?: boolean;
}

export function GradientCard({
  children,
  style,
  contentStyle,
  cornerHighlights = true,
}: GradientCardProps) {
  const pulse = useSharedValue(0.65);

  useEffect(() => {
    if (cornerHighlights) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1300 }),
          withTiming(0.65, { duration: 1300 })
        ),
        -1,
        true
      );
    }
  }, [cornerHighlights]);

  const animatedCornerStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <View style={[styles.wrapper, style]}>
      {cornerHighlights && (
        <Animated.View style={[StyleSheet.absoluteFill, animatedCornerStyle]} pointerEvents="none">
          {/* Top-Left Blue Corner */}
          <View style={[styles.cornerBase, styles.cornerTopLeft, { borderColor: '#60A5FA' }]} />
          {/* Top-Right Purple Corner */}
          <View style={[styles.cornerBase, styles.cornerTopRight, { borderColor: '#A855F7' }]} />
          {/* Bottom-Left Cyan Corner */}
          <View style={[styles.cornerBase, styles.cornerBottomLeft, { borderColor: '#22D3EE' }]} />
          {/* Bottom-Right Blue Corner */}
          <View style={[styles.cornerBase, styles.cornerBottomRight, { borderColor: '#3B82F6' }]} />
        </Animated.View>
      )}

      {/* Surface Card Content */}
      <View style={[styles.surface, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  surface: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 23,
    padding: 16,
  },
  cornerBase: {
    position: 'absolute',
    width: 22,
    height: 22,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 24,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 24,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 24,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 24,
  },
});
