"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookieAccepted");
    if (!accepted) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-3xl -translate-x-1/2 rounded-2xl border border-border bg-white p-4 shadow-lg">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted">
          Ez az oldal sütiket használ a működéshez. A böngészés folytatásával elfogadod.
        </p>
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            localStorage.setItem("cookieAccepted", "true");
            setVisible(false);
          }}
        >
          Elfogadom
        </Button>
      </div>
    </div>
  );
}
