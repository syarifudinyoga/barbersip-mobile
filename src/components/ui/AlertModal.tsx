import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
} from 'lucide-react-native';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface AlertOptions {
  title: string;
  text?: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertModalProps {
  visible: boolean;
  options: AlertOptions | null;
  onClose: () => void;
}

export function AlertModal({ visible, options, onClose }: AlertModalProps) {
  if (!options) return null;

  const {
    title,
    text,
    type = 'info',
    confirmText = 'OK',
    cancelText = 'Batal',
    onConfirm,
    onCancel,
  } = options;

  const isConfirm = type === 'confirm';

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={42} color="#34D399" />;
      case 'error':
        return <XCircle size={42} color="#F87171" />;
      case 'warning':
        return <AlertTriangle size={42} color="#FBBF24" />;
      case 'confirm':
        return <HelpCircle size={42} color="#60A5FA" />;
      default:
        return <HelpCircle size={42} color="#60A5FA" />;
    }
  };

  const handleConfirm = () => {
    onClose();
    if (onConfirm) onConfirm();
  };

  const handleCancel = () => {
    onClose();
    if (onCancel) onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.card}>
              <View style={styles.iconContainer}>{getIcon()}</View>
              <Text style={styles.title}>{title}</Text>
              {text ? <Text style={styles.text}>{text}</Text> : null}

              <View style={styles.buttonRow}>
                {isConfirm ? (
                  <TouchableOpacity
                    style={[styles.btn, styles.cancelBtn]}
                    onPress={handleCancel}
                  >
                    <Text style={styles.cancelBtnText}>{cancelText}</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={[
                    styles.btn,
                    styles.confirmBtn,
                    type === 'error' && { backgroundColor: '#DC2626' },
                    type === 'success' && { backgroundColor: '#16A34A' },
                  ]}
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmBtnText}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0f172a',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  text: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 8,
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtn: {
    backgroundColor: '#125AB8',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  cancelBtnText: {
    color: '#D1D5DB',
    fontWeight: '600',
    fontSize: 14,
  },
});

