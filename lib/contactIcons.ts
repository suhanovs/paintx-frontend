export type ContactIconKey = "telegram" | "youtube" | "whatsapp" | "maps" | "email";

export type ContactIconDef = {
  key: ContactIconKey;
  icon: string;
  buttonClass: string;
  url?: string;
};

const ICONS: Record<ContactIconKey, ContactIconDef> = {
  telegram: {
    key: "telegram",
    icon: "simple-icons:telegram",
    buttonClass: "hover:bg-blue-500",
    url: "https://t.me/+79119690469",
  },
  youtube: {
    key: "youtube",
    icon: "simple-icons:youtube",
    buttonClass: "hover:bg-red-500",
    url: "https://youtu.be/tHY3NkSewy8",
  },
  whatsapp: {
    key: "whatsapp",
    icon: "simple-icons:whatsapp",
    buttonClass: "hover:bg-green-500",
    url: "https://wa.me/79119690469",
  },
  maps: {
    key: "maps",
    icon: "mdi:map-marker",
    buttonClass: "hover:bg-yellow-500",
    url: "https://yandex.ru/maps/org/paintx/49452764850",
  },
  email: {
    key: "email",
    icon: "mdi:email-outline",
    buttonClass: "hover:bg-red-500",
  },
};

const VARIANT = (process.env.NEXT_PUBLIC_SITE_VARIANT || "en").toLowerCase();

const ENABLED_BY_VARIANT: Record<string, ContactIconKey[]> = {
  en: ["email"],
  ru: ["telegram", "youtube", "whatsapp", "maps", "email"],
};

export function getEnabledContactIcons(): ContactIconDef[] {
  const enabled = ENABLED_BY_VARIANT[VARIANT] || ENABLED_BY_VARIANT.en;
  return enabled.map((k) => ICONS[k]);
}
