export type MenuItem = {
  name: string;
  href: string;
  iconName: string;
  badgeKey?: 'pendingBookings' | 'pendingProductOrders' | 'pendingMembers' | 'pendingLeaves';
  comingSoon?: boolean;
};

export type MenuGroup = {
  label: string;
  iconName: string;
  items: MenuItem[];
};

export const adminMenu: MenuGroup[] = [
  {
    label: 'UMUM',
    iconName: 'LayoutDashboard',
    items: [
      { name: 'Dashboard Booking', href: '/(drawer)/dashboard', iconName: 'LayoutDashboard' },
      { name: 'Dashboard Produk', href: '/(drawer)/dashboard-products', iconName: 'Package' },
      { name: 'Leaderboard Member', href: '/(drawer)/members-leaderboard', iconName: 'Trophy' },
    ],
  },
  {
    label: 'LAYANAN',
    iconName: 'CalendarDays',
    items: [
      { name: 'Review Booking', href: '/(drawer)/service-booking', iconName: 'CalendarDays', badgeKey: 'pendingBookings' },
      { name: 'Review Produk', href: '/(drawer)/product-orders', iconName: 'ShoppingBag', badgeKey: 'pendingProductOrders' },
      { name: 'Cetak Struk', href: '/(drawer)/payment', iconName: 'ReceiptText' },
    ],
  },
  {
    label: 'MANAJEMEN',
    iconName: 'Scissors',
    items: [
      { name: 'Produk', href: '/(drawer)/product', iconName: 'Package' },
      { name: 'Capster', href: '/(drawer)/service-capster', iconName: 'Scissors' },
      { name: 'Harga Service', href: '/(drawer)/management-pricelist', iconName: 'CircleDollarSign' },
      { name: 'Harga Event', href: '/(drawer)/service-price-events', iconName: 'CalendarDays' },
      { name: 'Kupon', href: '/(drawer)/coupons', iconName: 'BadgePercent' },
      { name: 'Libur', href: '/(drawer)/management-holidays', iconName: 'CalendarX2' },
      { name: 'Cuti', href: '/(drawer)/management-leave', iconName: 'CalendarOff', badgeKey: 'pendingLeaves' },
      { name: 'Member', href: '/(drawer)/members', iconName: 'Users', badgeKey: 'pendingMembers' },
    ],
  },
  {
    label: 'SISTEM',
    iconName: 'Settings',
    items: [
      { name: 'Pengaturan Aplikasi', href: '/(drawer)/settings', iconName: 'Settings' },
      { name: 'Booking Manual', href: '/(drawer)/booking', iconName: 'CalendarDays' },
    ],
  },
];

export const memberMenu: MenuGroup[] = [
  {
    label: 'MENU',
    iconName: 'LayoutDashboard',
    items: [
      { name: 'Dashboard', href: '/(drawer)/dashboard', iconName: 'LayoutDashboard' },
      { name: 'Booking', href: '/(drawer)/members-booking', iconName: 'CalendarDays' },
      { name: 'Produk', href: '/(drawer)/members-products', iconName: 'Package' },
      { name: 'Riwayat', href: '/(drawer)/members-history', iconName: 'History' },
      { name: 'Leaderboard Member', href: '/(drawer)/members-leaderboard', iconName: 'Trophy' },
    ],
  },
];

export const superMenu: MenuGroup[] = [
  {
    label: 'DASHBOARD',
    iconName: 'LayoutDashboard',
    items: [
      { name: 'Dashboard Booking', href: '/(drawer)/dashboard', iconName: 'LayoutDashboard' },
      { name: 'Dashboard Produk', href: '/(drawer)/dashboard-products', iconName: 'Package' },
      { name: 'Dashboard Absensi', href: '/(drawer)/dashboard-attendance', iconName: 'UserCheck' },
      { name: 'Laporan', href: '/(drawer)/superadmin-reports', iconName: 'FileDown' },
    ],
  },
];

export const capsterMenu: MenuGroup[] = [
  {
    label: 'GENERAL',
    iconName: 'LayoutDashboard',
    items: [
      { name: 'Dashboard', href: '/(drawer)/dashboard', iconName: 'LayoutDashboard' },
    ],
  },
  {
    label: 'SERVICES',
    iconName: 'CalendarDays',
    items: [
      { name: 'Booking History', href: '/(drawer)/service-booking', iconName: 'CalendarDays' },
    ],
  },
  {
    label: 'SYSTEM',
    iconName: 'Settings',
    items: [
      { name: 'Attendance', href: '/(drawer)/attendance', iconName: 'Scissors' },
      { name: 'Attendance History', href: '/(drawer)/attendance-history', iconName: 'History' },
    ],
  },
];

