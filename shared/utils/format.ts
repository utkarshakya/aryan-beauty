export const INDIAN_PHONE_RE = /^[6-9]\d{9}$/;

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

export function formatCurrency(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", options ?? { day: "numeric", month: "short", year: "numeric" });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} · ${formatTime(date)}`;
}

export function toISODateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getTodayISO(): string {
  return toISODateString(new Date());
}