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

  return (
    <>
      <div className="flex flex-wrap gap-3 mt-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-gray-700 text-white w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-transform transform hover:scale-110 hover:bg-red-500"
          aria-label="Contact about this painting"
          title="Contact about this painting"
        >
          <Icon icon="mdi:email-outline" width={24} height={24} />
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
