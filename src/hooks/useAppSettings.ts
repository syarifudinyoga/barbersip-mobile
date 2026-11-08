import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

export type AppSettings = {
  company_name?: string;
  company_address?: string;
  company_opening_hours?: string;
  opening_time?: string;
  closing_time?: string;
  last_booking_before_close_minutes?: number;
  attendance_start_time?: string;
  attendance_min_checkout_hours?: number;
  attendance_latitude?: number;
  attendance_longitude?: number;
  attendance_radius_meters?: number;
  qris_image_url?: string | null;
  membership_fee?: number;
  membership_annual_fee?: number;
  membership_renewal_fee?: number;
  membership_renewal_reminder_days?: number;
  member_points_reserve?: number;
  point_terms?: string;
  call_center_whatsapp?: string;
  booking_code_prefix?: string;
  booking_code_pattern?: string;
  product_order_code_prefix?: string;
  product_order_code_pattern?: string;
  receipt_logo_enabled?: boolean;
  receipt_logo_text?: string;
  receipt_heading?: string;
  receipt_footer_text?: string;
  receipt_font_size?: number;
  receipt_alignment?: 'left' | 'center' | 'right';
  telegram_notification_enabled?: boolean;
  telegram_api_url?: string;
  telegram_authorization?: string;
  telegram_chat_id?: string;
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<AppSettings>('/api/settings');
      setSettings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat pengaturan aplikasi');
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return { settings, loading, error, reload: loadSettings };
}
