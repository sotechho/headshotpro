export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const parseBool = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
};
