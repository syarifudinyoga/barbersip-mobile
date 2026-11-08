import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface FloatingInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export function FloatingInput({
  label,
  value,
  onChangeText,
  error,
  containerStyle,
  isPassword = false,
  ...rest
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  const isFloating = isFocused || (value && value.length > 0);
  const top = useSharedValue(isFloating ? 6 : 16);
  const fontSize = useSharedValue(isFloating ? 11 : 14);

  const handleFocus = () => {
    setIsFocused(true);
    top.value = withTiming(6, { duration: 150 });
    fontSize.value = withTiming(11, { duration: 150 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value || value.length === 0) {
      top.value = withTiming(16, { duration: 150 });
      fontSize.value = withTiming(14, { duration: 150 });
    }
  };

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    top: top.value,
    fontSize: fontSize.value,
  }));

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.focusedBorder,
          error ? styles.errorBorder : null,
        ]}
      >
        <Animated.Text
          style={[
            styles.label,
            labelAnimatedStyle,
            isFocused && styles.focusedLabel,
            error ? styles.errorLabel : null,
          ]}
        >
          {label}
        </Animated.Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor="#6B7280"
          style={styles.input}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.toggleText}>
              {showPassword ? 'Sembunyikan' : 'Tampilkan'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputWrapper: {
    position: 'relative',
    height: 56,
    borderRadius: 14,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  focusedBorder: {
    borderColor: '#125AB8',
  },
  errorBorder: {
    borderColor: '#F87171',
  },
  label: {
    position: 'absolute',
    left: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  focusedLabel: {
    color: '#60A5FA',
  },
  errorLabel: {
    color: '#F87171',
  },
  input: {
    color: '#FFFFFF',
    fontSize: 15,
    paddingTop: 16,
    height: '100%',
    textAlignVertical: 'center',
  },
  toggleBtn: {
    position: 'absolute',
    right: 14,
    top: 18,
  },
  toggleText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  errorText: {
    marginTop: 4,
    color: '#F87171',
    fontSize: 12,
    marginLeft: 4,
  },
});

