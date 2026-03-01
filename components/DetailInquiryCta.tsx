"use client";

import { useState } from "react";
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
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm transition-colors"
        >
          Contact about this painting
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
