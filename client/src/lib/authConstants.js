// Shared auth validation constants, reused across sign-in, create-account, and
// reset-password so the password policy stays identical everywhere.

export const PASSWORD_REGEX =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])(?=.*[a-zA-Z]).{8,}$/;

export const PASSWORD_WEAK_MESSAGE =
  "Must be 8+ characters with an uppercase, lowercase, number and special character.";

// Drives the inline requirements checklist shown while choosing a password.
export const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "One number", test: (v) => /\d/.test(v) },
  { label: "One special character (!@#$%^&*()_+)", test: (v) => /[!@#$%^&*()_+]/.test(v) },
];
