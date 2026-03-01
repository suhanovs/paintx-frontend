"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import ContactInquiryPanel from "./ContactInquiryPanel";

interface Props {
  title: string;
  slug: string;
}

export default function DetailInquiryCta({ title, slug }: Props) {
  const [open, setOpen] = useState(false);
  const pageUrl = `https://www.paintx.art/art/${slug}`;
  const prefills = `I'm interested in \"${title}\".\nPage: ${pageUrl}`;

  const share = (platform: "facebook" | "x" | "instagram") => {
    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedText = encodeURIComponent(`${title} — ${pageUrl}`);

    if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank", "noopener,noreferrer");
      return;
    }

    if (platform === "x") {
      window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`, "_blank", "noopener,noreferrer");
      return;
    }

    // Instagram has no reliable web share endpoint; open profile as fallback.
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-4 items-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 transition-colors border border-gray-600 bg-gray-700/40 text-gray-300 text-sm hover:bg-red-500/25 hover:text-red-200"
          aria-label="Contact about this painting"
          title="Contact about this painting"
        >
          <Icon icon="mdi:email-outline" width={18} height={18} />
          Contact
        </button>

        <button
          type="button"
          onClick={() => share("facebook")}
          className="inline-flex items-center justify-center rounded-full w-10 h-10 border border-gray-600 bg-gray-700/40 text-gray-300 text-sm transition-colors hover:bg-gray-700/60"
          aria-label="Share on Facebook"
          title="Share on Facebook"
        >
          <Icon icon="mdi:facebook" width={18} height={18} />
        </button>

        <button
          type="button"
          onClick={() => share("instagram")}
          className="inline-flex items-center justify-center rounded-full w-10 h-10 border border-gray-600 bg-gray-700/40 text-gray-300 text-sm transition-colors hover:bg-gray-700/60"
          aria-label="Share on Instagram"
          title="Share on Instagram"
        >
          <Icon icon="mdi:instagram" width={18} height={18} />
        </button>

        <button
          type="button"
          onClick={() => share("x")}
          className="inline-flex items-center justify-center rounded-full w-10 h-10 border border-gray-600 bg-gray-700/40 text-gray-300 text-sm transition-colors hover:bg-gray-700/60"
          aria-label="Share on X"
          title="Share on X"
        >
          <Icon icon="simple-icons:x" width={16} height={16} />
        </button>
      </div>

      <ContactInquiryPanel
        open={open}
        onClose={() => setOpen(false)}
        initialComment={prefills}
        tipText="Share your email and message. We prefilled this painting page for context."
      />
    </>
  );
}
