import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { useAuth } from '../src/context/AuthContext';
import { GalaxyBackground } from '../src/components/ui/GalaxyBackground';
import { GradientCard } from '../src/components/ui/GradientCard';
import { FloatingInput } from '../src/components/ui/FloatingInput';
import { PrimaryButton } from '../src/components/ui/PrimaryButton';

export default function IndexScreen() {
  const { user, loading: authLoading, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto redirect jika user sudah terautentikasi
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/(drawer)/dashboard');
    }
  }, [user, authLoading]);

  const handleLogin = async () => {
    setError('');

    if (!email.trim() || !password) {
      setError('Email dan kata sandi wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      await login(email.trim(), password);
      router.replace('/(drawer)/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Email atau kata sandi tidak valid.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <GalaxyBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22D3EE" />
        </View>
      </GalaxyBackground>
    );
  }

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
          {/* Logo & Header */}
          <View style={styles.brandingBox}>
            <Image
              source={require('../assets/text-logo-blue.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Login Card */}
          <View style={styles.cardContainer}>
            <GradientCard cornerHighlights>
              <Text style={styles.title}>Masuk ke Akun</Text>
              <Text style={styles.subtitle}>
                Akses khusus Member, Capster, Admin, dan Superadmin
              </Text>

              <FloatingInput
                label="Email Akun"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <FloatingInput
                label="Kata Sandi"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  setError('');
                }}
                isPassword
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <PrimaryButton
                title={submitting ? 'Sedang Memverifikasi...' : 'Masuk Sekarang'}
                onPress={handleLogin}
                loading={submitting}
                style={styles.submitBtn}
              />

              <View style={styles.divider} />

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Ingin bergabung jadi member? </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text style={styles.footerLink}>Daftar Member</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  brandingBox: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: '90%',
    maxWidth: 340,
    height: 90,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: '#FB7185',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  submitBtn: {
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  footerLink: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
});
