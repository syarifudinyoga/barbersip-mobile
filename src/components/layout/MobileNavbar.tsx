import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogIn, LogOut, Menu, UserPlus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { WebSocketStatus } from './WebSocketStatus';

export interface MobileNavbarProps {
  onOpenMenu?: () => void;
  onOpenDrawer?: () => void;
}

export function MobileNavbar({ onOpenMenu, onOpenDrawer }: MobileNavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleMenuPress = () => {
    if (onOpenDrawer) onOpenDrawer();
    else if (onOpenMenu) onOpenMenu();
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Left: Menu Hamburger if logged in + Logo */}
        <View style={styles.leftGroup}>
          {onOpenDrawer || onOpenMenu ? (
            <TouchableOpacity
              style={styles.menuBtn}
              onPress={handleMenuPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Menu size={22} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity onPress={() => router.push(user ? '/(drawer)/dashboard' : '/')}>
            <Image
              source={require('../../../assets/text-logo-blue.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Right: Realtime WebSocket Pill + Auth buttons */}
        <View style={styles.rightGroup}>
          <WebSocketStatus />

          {user ? (
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <LogOut size={16} color="#FB7185" />
            </TouchableOpacity>
          ) : (
            <View style={styles.guestAuthGroup}>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.loginBtnText}>Masuk</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#030611',
  },
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(3, 6, 17, 0.90)',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBtn: {
    padding: 6,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logo: {
    width: 160,
    height: 40,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutBtn: {
    padding: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  guestAuthGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loginBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#125AB8',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
