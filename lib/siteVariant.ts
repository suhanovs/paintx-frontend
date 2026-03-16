export function isRuHost(host?: string | null): boolean {
  if (!host) return false;
  const h = host.toLowerCase();
  return h.includes(".ru") || h.includes("stage.paintx.ru");
}

export type SiteVariant = "en" | "ru";

export function variantFromHost(host?: string | null): SiteVariant {
  return isRuHost(host) ? "ru" : "en";
}
