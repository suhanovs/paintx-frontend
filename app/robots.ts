import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "Yandex", disallow: "/" },
      { userAgent: "YandexBot", disallow: "/" },
      { userAgent: "YandexImages", disallow: "/" },
      { userAgent: "YandexMetrika", disallow: "/" },
      { userAgent: "YandexMobileBot", disallow: "/" },
      { userAgent: "GPTBot", allow: "/", disallow: "/api/" },
      { userAgent: "ChatGPT-User", allow: "/", disallow: "/api/" },
      { userAgent: "Googlebot", allow: "/", disallow: "/api/" },
      { userAgent: "Google-Extended", allow: "/", disallow: "/api/" },
      { userAgent: "Bingbot", allow: "/", disallow: "/api/" },
      { userAgent: "Applebot", allow: "/", disallow: "/api/" },
      { userAgent: "ClaudeBot", allow: "/", disallow: "/api/" },
      { userAgent: "anthropic-ai", allow: "/", disallow: "/api/" },
      { userAgent: "PerplexityBot", allow: "/", disallow: "/api/" },
      { userAgent: "*", allow: "/", disallow: "/api/" },
    ],
    sitemap: "https://www.paintx.art/sitemap.xml",
  };
}
