import React from "react";

export function Section({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-6">
        {kicker && <div className="text-xs tracking-[0.2em] text-ocean-100/60">{kicker}</div>}
        <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}
