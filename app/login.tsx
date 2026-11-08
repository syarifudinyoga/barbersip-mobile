import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useAuth } from '../src/context/AuthContext';
import { GalaxyBackground } from '../src/components/ui/GalaxyBackground';
import { GradientCard } from '../src/components/ui/GradientCard';
import { FloatingInput } from '../src/components/ui/FloatingInput';
import { PrimaryButton } from '../src/components/ui/PrimaryButton';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      router.replace('/(drawer)/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GalaxyBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.cardContainer}>
            <GradientCard cornerHighlights>
              <View style={styles.headerRow}>
                <Text style={styles.title}>Selamat Datang</Text>
              </View>

              <FloatingInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <FloatingInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                isPassword
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <PrimaryButton
                title={loading ? 'Sedang masuk...' : 'Masuk'}
                onPress={handleLogin}
                loading={loading}
                style={styles.submitBtn}
              />

              <View style={styles.divider} />

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Belum punya akun? </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text style={styles.footerLink}>Daftar di sini</Text>
                </TouchableOpacity>
              </View>
            </GradientCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GalaxyBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EDEDED',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(159, 18, 57, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#F87171',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  submitBtn: {
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    marginVertical: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  footerLink: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '600',
  },
});

