// src/utils/passwordValidation.ts

export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?]{8,}$/;

export const DIGITS_ONLY_REGEX = /^\d{8,}$/;

export function validatePassword(
  password: string,
  regex: RegExp = STRONG_PASSWORD_REGEX
): string | null {
  if (!password) return null;

  if (!regex.test(password)) {
    if (regex === DIGITS_ONLY_REGEX) {
      return "Password must contain at least 8 digits.";
    }
    return "Password must be at least 8 characters including uppercase, lowercase, number, and special character.";
  }

  return null;
}
