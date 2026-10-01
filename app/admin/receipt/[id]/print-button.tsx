"use client";

import { Printer } from "lucide-react";

export function PrintReceiptButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      data-action="print"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer shadow-sm"
    >
      <Printer className="h-4 w-4" />
      Print Receipt
    </button>
  );
}
