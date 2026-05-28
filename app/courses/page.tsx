"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CourseCard, CourseCardSkeleton, generateMockCourses } from "../components/CourseCard";
import { ChevronLeft, ChevronRight, Search, ChevronDown } from "lucide-react";
import Link from "next/link";
import Auth from "../components/Auth";

const CoursesPageContent = () => {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const areaParam = searchParams.get("area");

  // Title based on params
  const title = typeParam ? `${typeParam}` : areaParam ? `${areaParam}` : "전체 교과목";
  const subtitle = typeParam ? "이수구분" : areaParam ? "이수영역" : "모든 교과목을 확인하세요";

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24; // 4 cols * 6 rows

  // Total 60 items for pagination demo
  const [allCourses] = useState(() => generateMockCourses(60));

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [typeParam, areaParam, currentPage]);

  const totalPages = Math.ceil(allCourses.length / itemsPerPage);
  const currentCourses = allCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/70 border border-white/50 backdrop-blur-sm shadow-sm rounded-full text-xs font-semibold text-[#666] mb-3">
            {subtitle}
          </div>
          <h1 className="text-3xl font-bold text-[#111]">{title}</h1>
        </div>
        <Auth />
      </div>

      {/* Search & Filter Bar (Same as Home but maybe just for visual consistency) */}
      <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-wrap md:flex-nowrap items-center gap-3">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-[#a3a3a3] group-focus-within:text-[#111] transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 border border-white/50 shadow-sm rounded-xl leading-5 bg-white/70 placeholder-[#888] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#111]/20 sm:text-sm transition-all font-medium"
            placeholder={`${title} 내에서 검색...`}
          />
        </div>
        <button className="bg-[#111]/90 hover:bg-[#111] text-white px-8 py-3 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 shrink-0">
          검색
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 24 }).map((_, i) => <CourseCardSkeleton key={`skeleton-course-${i}`} />)
          : currentCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-12">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/60 border border-white/50 shadow-sm text-[#111] disabled:opacity-50 hover:bg-white/90 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all shadow-sm ${isActive
                  ? "bg-[#111] text-white border-transparent"
                  : "bg-white/60 border border-white/50 text-[#111] hover:bg-white/90"
                }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/60 border border-white/50 shadow-sm text-[#111] disabled:opacity-50 hover:bg-white/90 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-medium text-gray-500">로딩중...</div>}>
      <CoursesPageContent />
    </Suspense>
  );
}
