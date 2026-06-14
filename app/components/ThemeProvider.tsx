"use client";

import { useSearchParams } from "next/navigation";
import { COLLEGE_COLOR_MAP, DEPARTMENT_COLOR_MAP } from "../constants/theme";
import { UNIVERSITY_DATA } from "../constants/menu";
import { Suspense } from "react";

function ThemeInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const college = searchParams.get("college");
  const department = searchParams.get("department");

  // Determine the college color
  let activeCollege = college;
  if (!activeCollege && department) {
    const matchedCollege = UNIVERSITY_DATA.find(u => u.departments.includes(department));
    if (matchedCollege) {
      activeCollege = matchedCollege.name;
    }
  }

  const collegeColor = activeCollege ? COLLEGE_COLOR_MAP[activeCollege] ?? "" : "";
  const departmentColor = department ? DEPARTMENT_COLOR_MAP[department] ?? "" : "";
  const themeColor = departmentColor || collegeColor || "";

  return (
    <div className={`min-h-screen w-full flex flex-col transition-colors duration-300 ${themeColor}`}>
      {children}
    </div>
  );
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex flex-col transition-colors duration-300">{children}</div>}>
      <ThemeInner>{children}</ThemeInner>
    </Suspense>
  );
}
