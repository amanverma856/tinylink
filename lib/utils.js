import crypto from "crypto";
import validator from "validator";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Generate short code 6–8 characters
export function genCode(len = 6) {
  let s = "";
  const bytes = crypto.randomBytes(len);
  for (let i = 0; i < len; i++) {
    s += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return s;
}

// Check valid code format
export function isValidShortCode(code) {
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}

// Normalize and validate URLs
export function normalizeUrl(u) {
  if (!u) return null;
  let candidate = u.trim();

  // add http if missing
  if (!candidate.startsWith("http://") && !candidate.startsWith("https://")) {
    candidate = "http://" + candidate;
  }

  if (!validator.isURL(candidate, { require_protocol: true })) return null;
  return candidate;
}
