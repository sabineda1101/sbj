"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { CourseCard, CourseCardSkeleton, generateMockCourses } from "./components/CourseCard";
import Auth from "./components/Auth";



export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  const basicCourses = generateMockCourses(8);
  const coreCourses = generateMockCourses(8);
  const advancedCourses = generateMockCourses(8);

  useEffect(() => {
    // Simulate loading from Supabase
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-12">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/70 border border-white/50 backdrop-blur-sm shadow-sm rounded-full text-xs font-semibold text-[#666] mb-3">
            INU 기초교육원
          </div>
          <h1 className="text-3xl font-bold text-[#111]">전체 교과목 조회</h1>
        </div>
        <Auth />
      </div>
      
      {/* Search Bar Section */}
      <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-wrap md:flex-nowrap items-center gap-3">
        {/* Category Select */}
        <div className="relative shrink-0">
          <select className="appearance-none bg-white/70 border border-white/50 shadow-sm rounded-xl pl-4 pr-10 py-3 text-sm font-semibold text-[#111] focus:outline-none focus:ring-2 focus:ring-[#111]/20 w-36 cursor-pointer transition-all hover:bg-white/90">
            <option value="">이수구분 전체</option>
            <option value="기초교양">기초교양</option>
            <option value="핵심교양">핵심교양</option>
            <option value="심화교양">심화교양</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none" />
        </div>

        {/* Area Select */}
        <div className="relative shrink-0">
          <select className="appearance-none bg-white/70 border border-white/50 shadow-sm rounded-xl pl-4 pr-10 py-3 text-sm font-semibold text-[#111] focus:outline-none focus:ring-2 focus:ring-[#111]/20 w-36 cursor-pointer transition-all hover:bg-white/90">
            <option value="">이수영역 전체</option>
            <option value="학문의기초">학문의기초</option>
            <option value="(핵심)과학기술">(핵심)과학기술</option>
            <option value="외국어">외국어</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none" />
        </div>

        {/* Search Input */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-[#a3a3a3] group-focus-within:text-[#111] transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 border border-white/50 shadow-sm rounded-xl leading-5 bg-white/70 placeholder-[#888] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#111]/20 sm:text-sm transition-all font-medium"
            placeholder="교과목명으로 검색하세요..."
          />
        </div>
        
        <button className="bg-[#111]/90 hover:bg-[#111] text-white px-8 py-3 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 shrink-0">
          검색
        </button>
      </div>

      {/* Courses Sections */}
      <div className="space-y-10">
        
        {/* 학문의 기초 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-[#111]">학문의 기초</h2>
            {!isLoading && <span className="px-2.5 py-1 bg-white/70 border border-white/50 backdrop-blur-sm rounded-full text-xs font-semibold text-[#666]">8</span>}
            <Link href="/courses?type=학문의 기초" className="ml-auto p-1.5 text-[#666] hover:text-[#111] hover:bg-white/60 rounded-full transition-all border border-transparent hover:border-white/50 hover:shadow-sm backdrop-blur-sm group/btn">
              <Plus size={20} className="group-hover/btn:scale-110 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <CourseCardSkeleton key={`skeleton-basic-${i}`} />)
              : basicCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
          </div>
        </section>

        {/* 핵심교양 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-[#111]">핵심교양</h2>
            {!isLoading && <span className="px-2.5 py-1 bg-white/70 border border-white/50 backdrop-blur-sm rounded-full text-xs font-semibold text-[#666]">8</span>}
            <Link href="/courses?type=핵심교양" className="ml-auto p-1.5 text-[#666] hover:text-[#111] hover:bg-white/60 rounded-full transition-all border border-transparent hover:border-white/50 hover:shadow-sm backdrop-blur-sm group/btn">
              <Plus size={20} className="group-hover/btn:scale-110 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <CourseCardSkeleton key={`skeleton-core-${i}`} />)
              : coreCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
          </div>
        </section>

        {/* 심화교양 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-[#111]">심화교양</h2>
            {!isLoading && <span className="px-2.5 py-1 bg-white/70 border border-white/50 backdrop-blur-sm rounded-full text-xs font-semibold text-[#666]">8</span>}
            <Link href="/courses?type=심화교양" className="ml-auto p-1.5 text-[#666] hover:text-[#111] hover:bg-white/60 rounded-full transition-all border border-transparent hover:border-white/50 hover:shadow-sm backdrop-blur-sm group/btn">
              <Plus size={20} className="group-hover/btn:scale-110 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <CourseCardSkeleton key={`skeleton-advanced-${i}`} />)
              : advancedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
          </div>
        </section>

      </div>
    </div>
  );
}
