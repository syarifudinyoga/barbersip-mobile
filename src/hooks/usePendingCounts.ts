import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';

export type PendingCounts = {
  pendingBookings: number;
  pendingProductOrders: number;
  pendingMembers: number;
  pendingLeaves: number;
};

export function usePendingCounts() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<PendingCounts>({
    pendingBookings: 0,
    pendingProductOrders: 0,
    pendingMembers: 0,
    pendingLeaves: 0,
  });

  const fetchCounts = async () => {
    if (!user || !['admin', 'superadmin'].includes(user.role)) return;

    try {
      const [bookingsRes, productsRes, membersRes, leavesRes] = await Promise.allSettled([
        apiFetch<{ totalBookings?: number }>('/api/bookings/pending/count-pending'),
        apiFetch<{ totalOrders?: number }>('/api/products/admin/orders/pending/count'),
        apiFetch<{ totalMembers?: number }>('/api/members/pending/count'),
        apiFetch<{ totalPending?: number }>('/api/barbers/holiday/pending/count'),
      ]);

      setCounts({
        pendingBookings: bookingsRes.status === 'fulfilled' ? bookingsRes.value.totalBookings ?? 0 : 0,
        pendingProductOrders: productsRes.status === 'fulfilled' ? productsRes.value.totalOrders ?? 0 : 0,
        pendingMembers: membersRes.status === 'fulfilled' ? membersRes.value.totalMembers ?? 0 : 0,
        pendingLeaves: leavesRes.status === 'fulfilled' ? leavesRes.value.totalPending ?? 0 : 0,
      });
    } catch (error) {
      console.error('Failed to fetch pending counts:', error);
    }
  };

  useEffect(() => {
    if (!user || !['admin', 'superadmin'].includes(user.role)) return;

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return { counts, reload: fetchCounts };
}

