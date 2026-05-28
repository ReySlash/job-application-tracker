export function getSignupRedirectUrl() {
  // Account confirmation should return users to the sign-in screen after email verification.
  return new URL(`${import.meta.env.BASE_URL}login`, window.location.origin).toString();
}

export function getResetPasswordRedirectUrl() {
  // BASE_URL keeps the recovery link valid in both local dev and GitHub Pages.
  return new URL(`${import.meta.env.BASE_URL}reset-password`, window.location.origin).toString();
}

export function hasPasswordRecoveryHash() {
  // Supabase appends recovery metadata in the URL hash after the email link redirect.
  return /(?:^|&)type=recovery(?:&|$)/.test(window.location.hash.replace(/^#/, ''));
}
