import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Upload, X } from 'lucide-react-native';
import { useAppSettings } from '../src/hooks/useAppSettings';
import { GalaxyBackground } from '../src/components/ui/GalaxyBackground';
import { GradientCard } from '../src/components/ui/GradientCard';
import { FloatingInput } from '../src/components/ui/FloatingInput';
import { PrimaryButton } from '../src/components/ui/PrimaryButton';
import { AlertModal, AlertOptions } from '../src/components/ui/AlertModal';
import { formatRupiah } from '../src/lib/format';
import { API_BASE_URL } from '../src/api/config';

export default function RegisterScreen() {
  const router = useRouter();
  const { settings } = useAppSettings();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null);

  const [form, setForm] = useState({
    name: '',
    whatsapp: '',
    address: '',
    birth_place: '',
    birth_date: '',
    email: '',
    instagram: '',
    tiktok: '',
    facebook: '',
    password: '',
    confirm: '',
  });

  const [paymentProofUri, setPaymentProofUri] = useState<string | null>(null);

  const updateField = (field: string, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleNextStep = () => {
    setError('');

    if (
      !form.name.trim() ||
      !form.address.trim() ||
      !form.birth_place.trim() ||
      !form.birth_date.trim() ||
      !form.whatsapp.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      setError('Semua data wajib diisi kecuali akun media sosial.');
      return;
    }

    if (![form.instagram, form.tiktok, form.facebook].some((v) => v.trim())) {
      setError('Isi minimal satu akun media sosial: IG, TikTok, atau FB.');
      return;
    }

    if (form.password.length < 8) {
      setError('Kata sandi harus terdiri dari minimal 8 karakter.');
      return;
    }

    if (form.password !== form.confirm) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setStep(2);
  };

  const pickPaymentProof = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setPaymentProofUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (!paymentProofUri) {
      setError('Unggah bukti pembayaran QRIS terlebih dahulu.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key !== 'confirm') {
          formData.append(key, val);
        }
      });

      const filename = paymentProofUri.split('/').pop() || 'payment-proof.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('paymentProof', {
        uri: paymentProofUri,
        name: filename,
        type,
      } as any);

      const response = await fetch(`${API_BASE_URL}/api/members`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || 'Pendaftaran member gagal');
      }

      setAlertOptions({
        title: 'Pendaftaran Berhasil',
        text: 'Bukti pembayaran berhasil dikirim. Akun member Anda sedang menunggu verifikasi admin.',
        type: 'success',
        confirmText: 'Ke Halaman Login',
        onConfirm: () => router.replace('/login'),
      });
    } catch (err: any) {
      setError(err?.message || 'Gagal mengirim pendaftaran.');
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
                <Text style={styles.title}>
                  {step === 1 ? 'Data Akun Member' : 'Pembayaran Member'}
                </Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => (step === 2 ? setStep(1) : router.push('/'))}
                >
                  <X size={18} color="#FDA4AF" />
                </TouchableOpacity>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {step === 1 ? (
                <>
                  <FloatingInput
                    label="Nama Lengkap"
                    value={form.name}
                    onChangeText={(val) => updateField('name', val)}
                  />

                  <FloatingInput
                    label="No. WhatsApp"
                    value={form.whatsapp}
                    onChangeText={(val) => updateField('whatsapp', val)}
                    keyboardType="phone-pad"
                  />

                  <FloatingInput
                    label="Alamat Lengkap"
                    value={form.address}
                    onChangeText={(val) => updateField('address', val)}
                  />

                  <FloatingInput
                    label="Tempat Lahir"
                    value={form.birth_place}
                    onChangeText={(val) => updateField('birth_place', val)}
                  />

                  <FloatingInput
                    label="Tanggal Lahir (YYYY-MM-DD)"
                    value={form.birth_date}
                    onChangeText={(val) => updateField('birth_date', val)}
                    placeholder="Contoh: 1995-05-20"
                  />

                  <FloatingInput
                    label="Email"
                    value={form.email}
                    onChangeText={(val) => updateField('email', val)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={styles.subheading}>
                    Sosial Media (minimal salah satu terisi)
                  </Text>
                  <FloatingInput
                    label="Instagram"
                    value={form.instagram}
                    onChangeText={(val) => updateField('instagram', val)}
                    placeholder="@username"
                  />
                  <FloatingInput
                    label="TikTok"
                    value={form.tiktok}
                    onChangeText={(val) => updateField('tiktok', val)}
                    placeholder="@username"
                  />
                  <FloatingInput
                    label="Facebook"
                    value={form.facebook}
                    onChangeText={(val) => updateField('facebook', val)}
                    placeholder="Nama / link FB"
                  />

                  <FloatingInput
                    label="Kata Sandi (min. 8 karakter)"
                    value={form.password}
                    onChangeText={(val) => updateField('password', val)}
                    isPassword
                  />

                  <FloatingInput
                    label="Konfirmasi Kata Sandi"
                    value={form.confirm}
                    onChangeText={(val) => updateField('confirm', val)}
                    isPassword
                  />

                  <PrimaryButton
                    title="Lanjut ke Pembayaran"
                    onPress={handleNextStep}
                    style={styles.submitBtn}
                  />
                </>
              ) : (
                <>
                  <View style={styles.paymentInfoBox}>
                    <Text style={styles.paymentInfoTitle}>Biaya Pendaftaran Member</Text>
                    <Text style={styles.paymentFee}>
                      {formatRupiah(settings?.membership_fee || 50000)}
                    </Text>
                    <Text style={styles.paymentInfoDesc}>
                      Scan QRIS berikut lalu unggah foto bukti transfer pembayaran.
                    </Text>

                    {settings?.qris_image_url ? (
                      <Image
                        source={{ uri: settings.qris_image_url }}
                        style={styles.qrisImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.qrisFallback}>
                        <Image
                          source={require('../assets/qris-sample.png')}
                          style={styles.qrisImage}
                          resizeMode="contain"
                        />
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.uploadArea}
                    onPress={pickPaymentProof}
                  >
                    <Upload size={24} color="#60A5FA" />
                    <Text style={styles.uploadTitle}>
                      {paymentProofUri
                        ? 'Ganti Bukti Transfer'
                        : 'Pilih Foto Bukti Transfer'}
                    </Text>
                    <Text style={styles.uploadSubtitle}>
                      Format JPG, PNG, atau WEBP
                    </Text>
                  </TouchableOpacity>

                  {paymentProofUri ? (
                    <View style={styles.previewBox}>
                      <Image
                        source={{ uri: paymentProofUri }}
                        style={styles.previewImage}
                      />
                    </View>
                  ) : null}

                  <View style={styles.buttonRow}>
                    <PrimaryButton
                      title="Kembali"
                      variant="secondary"
                      onPress={() => setStep(1)}
                      style={styles.backBtn}
                    />
                    <PrimaryButton
                      title={loading ? 'Mengirim...' : 'Kirim Pendaftaran'}
                      onPress={handleSubmit}
                      loading={loading}
                      style={styles.confirmRegisterBtn}
                    />
                  </View>
                </>
              )}
            </GradientCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AlertModal
        visible={!!alertOptions}
        options={alertOptions}
        onClose={() => setAlertOptions(null)}
      />
    </GalaxyBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 32,
    paddingBottom: 40,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EDEDED',
    textAlign: 'center',
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
    marginBottom: 14,
  },
  subheading: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  submitBtn: {
    marginTop: 10,
  },
  paymentInfoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentInfoTitle: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  paymentFee: {
    fontSize: 24,
    fontWeight: '700',
    color: '#34D399',
    marginTop: 4,
  },
  paymentInfoDesc: {
    color: '#6B7280',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  qrisImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  qrisFallback: {
    padding: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  uploadArea: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(96, 165, 250, 0.4)',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(18, 90, 184, 0.08)',
    marginBottom: 16,
  },
  uploadTitle: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },
  uploadSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  previewBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  backBtn: {
    flex: 1,
  },
  confirmRegisterBtn: {
    flex: 2,
  },
});

