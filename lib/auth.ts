// Lightweight shared-passcode gate, appropriate for "just me, maybe a few
// shooters later" use. When you're ready for real multi-user accounts,
// swap this out for NextAuth/Clerk and use lib/db.ts's shooterId as the
// per-user key (it's already threaded through the whole app).

export const AUTH_COOKIE = 'sc_auth';

export function isValidPasscode(input: string): boolean {
  const expected = process.env.APP_PASSCODE;
  if (!expected) return true; // no passcode configured => open access
  return input === expected;
}
