"use client";

import { useState, useEffect } from "react";

export function DateTime() {
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    setDate(new Date());
    const interval = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!date) return null;

  return (
    <div className="flex flex-col items-center justify-center text-[var(--color-stone)]">
      <h2 className="text-[2.5rem] font-display text-[var(--color-charcoal)] leading-none mb-1">
        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </h2>
      <p className="text-sm tracking-wide uppercase font-body">
        {date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
      </p>
    </div>
  );
}
