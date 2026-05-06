/**
 * Shared form validation utilities.
 * Returns error message string or empty string if valid.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return 'Email is required';
  if (!EMAIL_REGEX.test(trimmed)) return 'Please enter a valid email';
  return '';
}

export function validatePassword(value: string, minLength = 6): string {
  if (!value) return 'Password is required';
  if (value.length < minLength) return `Password must be at least ${minLength} characters`;
  return '';
}

/**
 * Validate all fields at once.
 * Returns a map of field → error message (empty string = no error).
 */
export function validateAuthForm(email: string, password: string) {
  return {
    email: validateEmail(email),
    password: validatePassword(password),
  };
}

/**
 * Returns true if all error values are empty strings.
 */
export function isFormValid(errors: Record<string, string>): boolean {
  return Object.values(errors).every((e) => e === '');
}

/**
 * Extract a human-readable error message from an Axios error response.
 */
export function extractApiError(error: any, fallback: string): string {
  const data = error?.response?.data;
  if (!data) return fallback;

  // NestJS can return message as string or string[]
  const msg = data.message;
  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg)) return msg.join(', ');
  return fallback;
}
