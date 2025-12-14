/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/dashboard" || href === "/") return pathname === "/" || pathname?.startsWith("/dashboard");
    return pathname?.startsWith(href);
  };

  return (
    <header className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-lg backdrop-blur">
      <Link href="/dashboard" className="flex items-center gap-3">
        <img
          src="/TalentLab_logo_v1.png"
          alt="TalentLab Logo"
          className="h-11 w-11 rounded-lg border border-white/10 bg-white/5 object-contain"
        />
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.12em] text-white">TalentLab</div>
          <div className="text-xs text-slate-300">Scouting Suite</div>
        </div>
      </Link>
      <nav className="hidden items-center gap-2 text-sm font-semibold text-slate-200 sm:flex">
        {[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/players", label: "Spieler" },
          { href: "/tournaments", label: "Turniere" },
          { href: "/venues", label: "Austragungsorte" },
          { href: "/admin", label: "Admin" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-3 py-2 transition ${
              isActive(item.href) ? "bg-[#e10600] text-white shadow-[0_8px_30px_rgba(225,6,0,0.35)]" : "hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
