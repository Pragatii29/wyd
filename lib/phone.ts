// Accepts "98765 43210", "+91 98765-43210", "098765 43210" etc.
// Without a "+", the number is treated as Indian (+91), since the form shows a +91 prefix.
export function normalizePhone(raw: string) {
  const digits = raw.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+")) return digits;
  if (/^0\d{10}$/.test(digits)) return `+91${digits.slice(1)}`;
  if (/^91\d{10}$/.test(digits)) return `+${digits}`;
  return `+91${digits}`;
}

export function isValidPhone(normalized: string) {
  return /^\+[1-9]\d{7,14}$/.test(normalized) && (!normalized.startsWith("+91") || /^\+91[6-9]\d{9}$/.test(normalized));
}
