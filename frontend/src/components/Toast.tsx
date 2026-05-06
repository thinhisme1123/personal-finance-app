import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors, radii, shadows, spacing } from '../theme';

// ─── Types ───
type ToastType = 'success' | 'error' | 'info';

type ToastMessage = {
  id: number;
  text: string;
  type: ToastType;
};

// ─── Global controller ───
let _showToast: ((text: string, type: ToastType) => void) | null = null;

export function showToast(text: string, type: ToastType = 'info') {
  _showToast?.(text, type);
}

// ─── Component ───
let _nextId = 0;

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -30, duration: 250, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [opacity, translateY]);

  const show = useCallback(
    (text: string, type: ToastType) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      const id = ++_nextId;
      setToast({ id, text, type });

      // Reset and animate in
      opacity.setValue(0);
      translateY.setValue(-30);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();

      // Auto dismiss after 3s
      timerRef.current = setTimeout(hide, 3000);
    },
    [opacity, translateY, hide],
  );

  useEffect(() => {
    _showToast = show;
    return () => {
      _showToast = null;
    };
  }, [show]);

  const bgColor =
    toast?.type === 'success'
      ? colors.income
      : toast?.type === 'error'
        ? colors.expense
        : colors.primary;

  const icon =
    toast?.type === 'success' ? '✓' : toast?.type === 'error' ? '✕' : 'ℹ';

  return (
    <>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.container,
            { backgroundColor: bgColor, opacity, transform: [{ translateY }] },
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={styles.inner}
            onPress={hide}
            activeOpacity={0.9}
          >
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.text} numberOfLines={2}>
              {toast.text}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    left: spacing.base,
    right: spacing.base,
    borderRadius: radii.md,
    ...shadows.cardHover,
    zIndex: 9999,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  icon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginRight: spacing.sm,
    width: 24,
    textAlign: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
