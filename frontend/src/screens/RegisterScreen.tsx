import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { register, login } from '../services/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { colors, spacing, radii, shadows, typography } from '../theme';
import { validateEmail, validatePassword, isFormValid, extractApiError } from '../utils/validation';
import { showToast } from '../components/Toast';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });

  const passwordRef = useRef<TextInput>(null);

  // Live validation on blur
  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: field === 'email' ? validateEmail(email) : validatePassword(password),
    }));
  };

  // Clear error when user starts typing
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleRegister = async () => {
    // Validate all fields on submit
    const newErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(newErrors);
    setTouched({ email: true, password: true });

    if (!isFormValid(newErrors)) return;
    if (loading) return; // prevent double-tap

    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), password);
      // Auto-login after registration
      const res = await login(email.trim().toLowerCase(), password);
      await AsyncStorage.setItem('access_token', res.data.access_token);
      showToast('Register successfully', 'success');
      setTimeout(() => navigation.replace('MainTabs'), 600);
    } catch (error: any) {
      const msg = extractApiError(error, 'Registration failed. Please try again.');
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🚀</Text>
        </View>
        <Text style={styles.title}>Get Started</Text>
        <Text style={styles.subtitle}>Create your finance account</Text>

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, touched.email && errors.email ? styles.inputError : null]}
          placeholder="you@example.com"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={handleEmailChange}
          onBlur={() => handleBlur('email')}
          onSubmitEditing={() => passwordRef.current?.focus()}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
          editable={!loading}
        />
        {touched.email && errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : null}

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <TextInput
          ref={passwordRef}
          style={[styles.input, touched.password && errors.password ? styles.inputError : null]}
          placeholder="Min 6 characters"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={handlePasswordChange}
          onBlur={() => handleBlur('password')}
          onSubmitEditing={handleRegister}
          secureTextEntry
          returnKeyType="done"
          editable={!loading}
        />
        {touched.password && errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
        >
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    ...shadows.cardHover,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    ...typography.caption,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    color: colors.textPrimary,
    borderRadius: radii.md,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.expense,
    backgroundColor: colors.expenseBg,
  },
  errorText: {
    color: colors.expense,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  button: {
    backgroundColor: colors.income,
    borderRadius: radii.md,
    padding: 16,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  linkButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  linkBold: {
    color: colors.primary,
    fontWeight: '700',
  },
});
