"use client";

import { openCookieSettings } from "./cookie-consent";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => openCookieSettings()}
      className="text-left text-[#14141A] hover:text-[#374BFF] transition-colors cursor-pointer"
    >
      Cookie Settings
    </button>
  );
}
