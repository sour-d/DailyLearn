const ENCODER = new TextEncoder();
const SESSION_DURATION_MS = 60 * 60 * 1000; // 1 hour
export const SESSION_COOKIE = "daily-learn-session";

async function hmacSign(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    ENCODER.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, ENCODER.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

export async function createSessionToken(pin: string): Promise<string> {
  const payload = btoa(JSON.stringify({ exp: Date.now() + SESSION_DURATION_MS }));
  const sig = await hmacSign(payload, pin);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(
  token: string,
  pin: string
): Promise<boolean> {
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return false;

    const expected = await hmacSign(payload, pin);
    if (expected !== sig) return false;

    const { exp } = JSON.parse(atob(payload));
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}
