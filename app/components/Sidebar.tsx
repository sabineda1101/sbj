"use client";

import { MENU_DATA } from "@/app/constants/menu";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "핵심교양": true,
    "심화교양": true,
    "기초교양": true,
  });

  if (pathname?.startsWith("/auth")) return null;

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <aside className="w-[280px] h-[calc(100vh-32px)] bg-[#1c1c1c] text-[#a3a3a3] rounded-2xl flex flex-col m-4 overflow-hidden shadow-xl border border-[#2e2e2e] shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-[#2e2e2e]">
        <span className="font-semibold text-[#ededed] text-lg">INU 기초교육원</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        {Object.entries(MENU_DATA).map(([category, items]) => {
          const isOpen = openSections[category];

          return (
            <div key={category} className="mb-3 last:mb-0">
              {/* Category Header */}
              <button
                onClick={() => toggleSection(category)}
                className="w-full flex items-center justify-between px-6 py-2 text-xs font-bold tracking-widest text-[#666] uppercase hover:text-[#ededed] transition-colors"
              >
                <span>{category}</span>
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {/* Items */}
              {isOpen && (
                <div className="mt-1 flex flex-col space-y-0.5 px-4">
                  {items.map((item) => (
                    <Link
                      key={item}
                      href={`/courses?area=${encodeURIComponent(item)}`}
                      className="text-left px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-[#2e2e2e] hover:text-[#ededed] transition-all flex items-center justify-between group"
                    >
                      <span className="truncate">{item}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      
      {/* Bottom Option like in the image */}
      <div className="p-4 border-t border-[#2e2e2e]">
        <button className="w-full text-center px-4 py-3 rounded-xl text-sm font-semibold bg-transparent border border-[#2e2e2e] text-[#ededed] hover:bg-[#2e2e2e] transition-colors">
          Settings
        </button>
      </div>
    </aside>
  );
}
