import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  LayoutDashboard,
  CalendarDays,
  Scissors,
  Users,
  Settings,
  History,
  CalendarOff,
  CalendarX2,
  ReceiptText,
  ShoppingBag,
  Package,
  UserCheck,
  FileDown,
  BadgePercent,
  Trophy,
  ChevronDown,
  X,
  CircleDollarSign,
} from 'lucide-react-native';
import { usePathname, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { usePendingCounts } from '../../hooks/usePendingCounts';
import { adminMenu, capsterMenu, memberMenu, superMenu } from './menu';

const iconMap: Record<string, React.ComponentType<any>> = {
  LayoutDashboard,
  CalendarDays,
  Scissors,
  Users,
  Settings,
  History,
  CalendarOff,
  CalendarX2,
  ReceiptText,
  ShoppingBag,
  Package,
  UserCheck,
  FileDown,
  BadgePercent,
  Trophy,
  CircleDollarSign,
};

interface RoleDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function RoleDrawer({ visible, onClose }: RoleDrawerProps) {
  const { user } = useAuth();
  const { counts } = usePendingCounts();
  const router = useRouter();
  const pathname = usePathname();

  const [openGroups, setOpenGroups] = useState<string[]>([
    'UMUM',
    'LAYANAN',
    'MANAJEMEN',
    'SISTEM',
    'MENU',
    'DASHBOARD',
    'GENERAL',
    'SERVICES',
  ]);

  if (!user) return null;

  const menus = {
    superadmin: superMenu,
    admin: adminMenu,
    member: memberMenu,
    capster: capsterMenu,
    barber: capsterMenu,
  };

  const currentMenu = menus[user.role] || memberMenu;

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const handleNavigate = (href: string) => {
    onClose();
    router.push(href as any);
  };

  const getBadgeCount = (badgeKey?: string) => {
    if (!badgeKey) return 0;
    return counts[badgeKey as keyof typeof counts] || 0;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.drawerContainer}>
              {/* Drawer Header */}
              <View style={styles.drawerHeader}>
                <View>
                  <Text style={styles.drawerTitle}>Menu Panel</Text>
                  <Text style={styles.drawerSubtitle}>{user.name} ({user.role})</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <X size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Menu Groups */}
              <ScrollView style={styles.menuScroll} contentContainerStyle={styles.menuContent}>
                {currentMenu.map((group) => {
                  const isOpen = openGroups.includes(group.label);
                  const GroupIcon = iconMap[group.iconName] || LayoutDashboard;

                  return (
                    <View key={group.label} style={styles.groupCard}>
                      <TouchableOpacity
                        style={styles.groupHeader}
                        onPress={() => toggleGroup(group.label)}
                      >
                        <View style={styles.groupHeaderLeft}>
                          <GroupIcon size={14} color="#9CA3AF" />
                          <Text style={styles.groupLabel}>{group.label}</Text>
                        </View>
                        <ChevronDown
                          size={14}
                          color="#9CA3AF"
                          style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                        />
                      </TouchableOpacity>

                      {isOpen ? (
                        <View style={styles.groupItems}>
                          {group.items.map((item) => {
                            const active = pathname === item.href;
                            const ItemIcon = iconMap[item.iconName] || LayoutDashboard;
                            const badge = getBadgeCount(item.badgeKey);

                            return (
                              <TouchableOpacity
                                key={item.href}
                                style={[styles.menuItem, active && styles.menuItemActive]}
                                onPress={() => handleNavigate(item.href)}
                              >
                                <ItemIcon
                                  size={16}
                                  color={active ? '#60A5FA' : '#9CA3AF'}
                                />
                                <Text
                                  style={[
                                    styles.menuItemText,
                                    active && styles.menuItemTextActive,
                                  ]}
                                >
                                  {item.name}
                                </Text>

                                {badge > 0 ? (
                                  <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                      {badge > 99 ? '99+' : badge}
                                    </Text>
                                  </View>
                                ) : null}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
  },
  drawerContainer: {
    width: '82%',
    maxWidth: 320,
    height: '100%',
    backgroundColor: 'rgba(7, 13, 25, 0.98)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.10)',
    paddingTop: 48,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#125AB8',
  },
  drawerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    padding: 14,
    gap: 12,
  },
  groupCard: {
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.2,
  },
  groupItems: {
    marginTop: 8,
    paddingLeft: 6,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.10)',
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  menuItemActive: {
    backgroundColor: 'rgba(18, 90, 184, 0.20)',
    borderWidth: 1,
    borderColor: 'rgba(18, 90, 184, 0.40)',
  },
  menuItemText: {
    flex: 1,
    fontSize: 13,
    color: '#D1D5DB',
  },
  menuItemTextActive: {
    color: '#60A5FA',
    fontWeight: '600',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

