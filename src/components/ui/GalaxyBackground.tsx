import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function GalaxyBackground({ children }: { children?: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#030611', '#081125', '#020617', '#030611']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Decorative ambient glowing orbs */}
      <View style={[styles.ambientGlow, styles.blueGlow]} />
      <View style={[styles.ambientGlow, styles.cyanGlow]} />
      <View style={[styles.ambientGlow, styles.purpleGlow]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#030611',
  },
  ambientGlow: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.15,
  },
  blueGlow: {
    top: -60,
    left: '20%',
    width: 240,
    height: 240,
    backgroundColor: '#125AB8',
  },
  cyanGlow: {
    bottom: 80,
    right: -40,
    width: 200,
    height: 200,
    backgroundColor: '#22D3EE',
  },
  purpleGlow: {
    top: '40%',
    left: -50,
    width: 180,
    height: 180,
    backgroundColor: '#A855F7',
  },
});
