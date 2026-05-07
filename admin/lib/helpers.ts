export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);

  const formattedDate = new Intl.DateTimeFormat("tr-TR", {
    month: "short",
    year: "numeric",
    day: "numeric",
  }).format(date);

  return formattedDate;
};

export const formatFullTimestamp = (dateStr: string) => {
  const date = new Date(dateStr);

  // Your existing logic for "May 05, 2026"
  const datePart = new Intl.DateTimeFormat("tr-TR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  // New logic for "14:20:44"
  const timePart = new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);

  return { datePart, timePart };
};

export const formatCurrency = (
  value: number | string,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "0,00";

  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(num);
};

export const getLogoUrl = (websiteUrl: string | undefined) => {
  if (!websiteUrl) return "";

  // Remove https://, http://, and www.
  const domain = websiteUrl
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .split("/")[0]; // Ensure we only get the base domain

  return `https://img.logo.dev/${domain}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_PK}`;
};
