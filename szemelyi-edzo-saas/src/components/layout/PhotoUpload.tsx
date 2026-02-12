"use client";

import { useState } from "react";

export function PhotoUpload() {
  const [status, setStatus] = useState<string | null>(null);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus("Feltöltés...");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    if (response.ok) {
      setStatus("Sikeres feltöltés.");
      window.location.reload();
    } else {
      const data = await response.json();
      setStatus(data.error ?? "Hiba történt.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="file" accept="image/*" onChange={handleUpload} />
      {status ? <p className="text-sm text-muted">{status}</p> : null}
      <p className="text-xs text-muted">Max 3 kép / hét.</p>
    </div>
  );
}
