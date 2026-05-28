"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useOrder } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { getSupabase } from "../utils/supabase";
import Auth from "../components/Auth";
import { Trash2, BookOpen, ChevronLeft, Calendar, CreditCard, X, Loader2, Check, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Course } from "../context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const { addOrder } = useOrder();
  const { user, isSupabase } = useAuth();
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalCredits = cart.reduce((sum, item) => sum + item.credits, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleCheckout = async () => {
    if (cart.length === 0 || !user || isSubmitting) return;

    setIsSubmitting(true);

    // If Supabase is not reachable, fall back to mock mode immediately
    if (!isSupabase) {
      addOrder(cart);
      clearCart();
      setToastMessage("수강 신청이 완료되었습니다!");
      setIsSubmitting(false);
      setTimeout(() => router.push("/orders"), 1500);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      // getSupabase returned null despite isSupabase being true — edge case fallback
      addOrder(cart);
      clearCart();
      setToastMessage("수강 신청이 완료되었습니다!");
      setIsSubmitting(false);
      setTimeout(() => router.push("/orders"), 1500);
      return;
    }

    try {
      // 1. Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_price: totalPrice,
          total_credits: totalCredits,
          status: 'completed'
        })
        .select('id')
        .single();

      if (orderError || !orderData) {
        throw new Error(orderError?.message || "Order creation failed");
      }

      const orderId = orderData.id;

      // 2. Create order items
      const orderItems = cart.map(item => ({
        order_id: orderId,
        course_id: item.id,
        course_name: item.name,
        professor: item.professor,
        schedule: item.schedule,
        credits: item.credits,
        capacity: item.capacity,
        grading: item.grading,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      // 3. Rollback if items fail
      if (itemsError) {
        await supabase.from("orders").delete().eq('id', orderId);
        throw new Error(itemsError.message);
      }

      // Success
      addOrder(cart); // Update local context if needed
      clearCart();
      setToastMessage("수강 신청이 완료되었습니다!");
      
      setTimeout(() => {
        router.push("/orders");
      }, 1500);
      
    } catch (error) {
      console.error("Checkout error:", error);
      setToastMessage("수강 신청에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#111]/90 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-bounce border border-white/10 backdrop-blur-md z-[99999]">
          <div className={`w-2 h-2 rounded-full ${toastMessage.includes("실패") ? "bg-red-400" : "bg-green-400"} animate-pulse`} />
          {toastMessage}
        </div>
      )}
      {/* Header */}
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-2 hover:bg-white/60 border border-transparent hover:border-white/50 backdrop-blur-sm rounded-full transition-all text-gray-500 hover:text-[#111]"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <span className="text-xs font-semibold text-[#666] tracking-wider uppercase">Cart Overview</span>
            <h1 className="text-3xl font-extrabold text-[#111] tracking-tight mt-0.5">내 장바구니</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/orders" className="px-4 py-2 bg-white/70 hover:bg-white/90 border border-white/50 hover:border-[#111]/30 backdrop-blur-sm shadow-sm rounded-xl text-sm font-semibold text-[#111] transition-all hover:-translate-y-0.5 cursor-pointer hover:shadow-md">
            주문내역
          </Link>
          <Auth />
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white/40 border border-white/40 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl p-16 text-center space-y-6 max-w-xl mx-auto mt-12 transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)] border-dashed border-2">
          <div className="w-16 h-16 mx-auto bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 shadow-sm">
            <BookOpen size={28} />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#111]">장바구니가 비어 있습니다</h2>
            <p className="text-xs text-[#666] max-w-[280px] mx-auto leading-relaxed">
              기초교육원 개설 과목 중 원하는 교과목을 탐색하여 장바구니에 추가해 보세요.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#111] hover:bg-[#333] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            교과목 보러 가기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white/60 border border-white/50 backdrop-blur-md shadow-sm rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-md hover:bg-white/80"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-extrabold border border-blue-100">
                      {item.credits}학점
                    </span>
                    <h3 
                      className="text-lg font-bold text-[#111] tracking-tight cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => setSelectedCourse(item)}
                    >
                      {item.name}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#666] font-medium">
                    <span className="flex items-center gap-1">
                      <span className="text-[#a3a3a3]">교수:</span> {item.professor}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-[#a3a3a3]" /> {item.schedule}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-[#a3a3a3]">평가:</span> {item.grading}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block font-medium">수강가격</span>
                    <span className="text-base font-extrabold text-[#111]">
                      {item.price.toLocaleString()}원
                    </span>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 border border-white/60 backdrop-blur-md shadow-lg rounded-3xl p-6 space-y-6 sticky top-8">
              <h2 className="text-lg font-bold text-[#111]">신청 요약</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-[#666]">신청 과목수</span>
                  <span className="text-[#111]">{cart.length}개</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-[#666]">총 신청학점</span>
                  <span className="text-blue-600 font-bold">{totalCredits}학점</span>
                </div>
                <div className="border-t border-black/[0.06] pt-4 flex justify-between items-end">
                  <span className="text-sm text-[#666] font-semibold">최종 수강비용</span>
                  <span className="text-2xl font-black text-[#111] tracking-tight">
                    {totalPrice.toLocaleString()}원
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isSubmitting || cart.length === 0 || !user}
                className="w-full py-4 bg-[#111] hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-white rounded-2xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CreditCard size={18} />
                )}
                {isSubmitting ? "결제 진행중..." : "수강 신청 완료하기"}
              </button>

              <p className="text-[10px] text-center text-gray-400 leading-normal px-2">
                * 수강 신청 완료 전 다른 요일/시간대의 개설 강좌 중복 여부를 최종 확인해 주시기 바랍니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300" onClick={() => setSelectedCourse(null)}>
          <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl p-8 max-w-lg w-full shadow-2xl transform scale-100 transition-transform duration-300 relative" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold mb-3 border border-blue-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {selectedCourse.credits}학점
                </span>
                <h2 className="text-2xl font-bold text-[#111] tracking-tight">{selectedCourse.name}</h2>
              </div>
              <button onClick={() => setSelectedCourse(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer">
                <X size={20} className="text-[#666]" />
              </button>
            </div>
            
            {/* Body */}
            <div className="space-y-4 bg-white/50 rounded-2xl p-5 border border-white/60 shadow-sm">
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 font-medium">담당교수</span>
                <span className="font-semibold text-[#111]">{selectedCourse.professor}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 font-medium">시간표</span>
                <span className="font-semibold text-[#111]">{selectedCourse.schedule}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 font-medium">성적평가</span>
                <span className="font-semibold text-[#111]">{selectedCourse.grading}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 font-medium">수강가격</span>
                <span className="font-bold text-blue-600 text-lg">{selectedCourse.price.toLocaleString()}원</span>
              </div>
              
              <div className="pt-2">
                <h4 className="text-sm font-semibold text-[#111] mb-2">교과목 소개</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  이 교과목은 <strong>{selectedCourse.name}</strong>에 대한 전반적인 이해를 돕고, 실무에 적용할 수 있는 핵심 역량을 기르는 것을 목표로 합니다. 최신 트렌드를 반영한 커리큘럼으로 전문성을 높일 수 있습니다.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => {
                  removeFromCart(selectedCourse.id);
                  setSelectedCourse(null);
                }}
                className="flex-1 py-4 rounded-xl text-sm font-semibold transition-colors flex justify-center items-center gap-2 shadow-md cursor-pointer bg-red-50 hover:bg-red-100 text-red-500"
              >
                <Trash2 size={18} />
                장바구니에서 제거
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
