export function readOptionalEnv(name: string, fallback = "") {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  return value;
}

export function readRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSiteUrl() {
  return readOptionalEnv("NEXT_PUBLIC_SITE_URL", "https://zerocool-development.com");
}

export function getContactEmail() {
  return readOptionalEnv(
    "CONTACT_EMAIL",
    readOptionalEnv("LEAD_TO_EMAIL", "zerocool.development.project@gmail.com")
  );
}

export function getLeadSenderEmail() {
  return readOptionalEnv("LEAD_FROM_EMAIL", "onboarding@resend.dev");
}
