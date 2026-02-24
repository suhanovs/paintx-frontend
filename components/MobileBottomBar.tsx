"use client";

import { Icon } from "@iconify/react";

const TELEGRAM_URL = "https://t.me/+79119690469";
const YOUTUBE_URL  = "https://youtu.be/tHY3NkSewy8";
const WHATSAPP_URL = "https://wa.me/79119690469";
const MAPS_URL     = "https://yandex.ru/maps/org/paintx/49452764850";

const links = [
  { href: TELEGRAM_URL, icon: "simple-icons:telegram",  label: "Telegram",  hover: "hover:text-blue-400"   },
  { href: WHATSAPP_URL, icon: "simple-icons:whatsapp",  label: "WhatsApp",  hover: "hover:text-green-400"  },
  { href: YOUTUBE_URL,  icon: "simple-icons:youtube",   label: "YouTube",   hover: "hover:text-red-400"    },
  { href: MAPS_URL,     icon: "mdi:map-marker",         label: "Find us",   hover: "hover:text-yellow-400" },
];

export default function MobileBottomBar() {
  return (
    <nav
      aria-label="Contact"
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-black/95 border-t border-gray-800"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around px-2 py-3">
        {links.map(({ href, icon, label, hover }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center gap-1 text-gray-400 transition-colors ${hover}`}
          >
            <Icon icon={icon} width={22} />
            <span className="text-[10px] leading-none">{label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
