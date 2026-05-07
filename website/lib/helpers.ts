export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return formattedDate;
};

export const formatCurrency = (
  value: number | string,
  minimumFractionDigits = 2,
  maximumFractionDigits = 4,
): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "0,00";

  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(num);
};

export const formatVol = (val: string | number) =>
  new Intl.NumberFormat("tr-TR", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(Number(val));

export const getLogoUrl = (websiteUrl: string | undefined) => {
  if (!websiteUrl) return "";

  // Remove https://, http://, and www.
  const domain = websiteUrl
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .split("/")[0]; // Ensure we only get the base domain

  return `https://img.logo.dev/${domain}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_PK}`;
};
