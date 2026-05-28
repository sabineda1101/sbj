"use client";

import { useAuth } from "../context/AuthContext";
import { useOrder, OrderGroup } from "../context/OrderContext";
import { getSupabase } from "../utils/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Auth from "../components/Auth";
import {
  ChevronLeft,
  Package,
  BookOpen,
  Calendar,
  CreditCard,
  CheckCircle2,
  Loader2,
  User,
} from "lucide-react";

interface SupabaseOrderItem {
  id: string;
  course_id: string;
  course_name: string;
  professor: string;
  schedule: string;
  credits: number;
  capacity: number;
  grading: string;
  price: number;
}

interface SupabaseOrder {
  id: string;
  status: string;
  total_price: number;
  total_credits: number;
  created_at: string;
  order_items: SupabaseOrderItem[];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrdersPage() {
  const { user, isLoading: authLoading, isSupabase } = useAuth();
  const { orders: mockOrders } = useOrder();
  const router = useRouter();

  const [orders, setOrders] = useState<SupabaseOrder[] | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [usesMock, setUsesMock] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (authLoading || !user) return;

    // If Supabase is unreachable, use mock mode immediately
    if (!isSupabase) {
      setUsesMock(true);
      const converted: SupabaseOrder[] = mockOrders.map((o: OrderGroup) => ({
        id: o.id,
        status: o.status,
        total_price: o.totalPrice,
        total_credits: o.totalCredits,
        created_at: o.orderDate,
        order_items: o.items.map((item) => ({
          id: item.id,
          course_id: item.id,
          course_name: item.name,
          professor: item.professor,
          schedule: item.schedule,
          credits: item.credits,
          capacity: item.capacity,
          grading: item.grading,
          price: item.price,
        })),
      }));
      setOrders(converted);
      setIsFetching(false);
      return;
    }

    const fetchOrders = async () => {
      setIsFetching(true);
      const supabase = getSupabase();
      if (!supabase) {
        setIsFetching(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOrders(data as SupabaseOrder[]);
      } catch (e) {
        console.error("Failed to fetch orders:", e);
        // Fallback to mock on error
        setUsesMock(true);
        const converted: SupabaseOrder[] = mockOrders.map((o: OrderGroup) => ({
          id: o.id,
          status: o.status,
          total_price: o.totalPrice,
          total_credits: o.totalCredits,
          created_at: o.orderDate,
          order_items: o.items.map((item) => ({
            id: item.id,
            course_id: item.id,
            course_name: item.name,
            professor: item.professor,
            schedule: item.schedule,
            credits: item.credits,
            capacity: item.capacity,
            grading: item.grading,
            price: item.price,
          })),
        }));
        setOrders(converted);
      } finally {
        setIsFetching(false);
      }
    };

    fetchOrders();
  }, [authLoading, user, mockOrders]);

  if (authLoading || !user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-2 hover:bg-white/60 border border-transparent hover:border-white/50 backdrop-blur-sm rounded-full transition-all text-gray-500 hover:text-[#111]"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <span className="text-xs font-semibold text-[#666] tracking-wider uppercase">
              Order History
            </span>
            <h1 className="text-3xl font-extrabold text-[#111] tracking-tight mt-0.5">
              내 주문내역
            </h1>
          </div>
        </div>
        <Auth />
      </div>

      {/* Mock badge */}
      {usesMock && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-700">
          ⚠ 로컬 저장 데이터 (Supabase 미연결)
        </div>
      )}

      {/* Loading */}
      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={36} className="animate-spin text-[#4285F4]" />
          <p className="text-sm text-gray-500 font-medium">주문내역을 불러오는 중...</p>
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order, orderIdx) => (
            <div
              key={order.id}
              className="bg-white/70 border border-white/60 backdrop-blur-md shadow-md rounded-3xl overflow-hidden transition-all hover:shadow-lg"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-white/50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center">
                    <CheckCircle2 size={18} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">
                      주문 #{orders.length - orderIdx}
                    </p>
                    <p className="text-sm font-bold text-[#111]">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400">총 학점</p>
                    <p className="text-sm font-bold text-blue-600">{order.total_credits}학점</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400">결제금액</p>
                    <p className="text-base font-black text-[#111]">
                      {order.total_price.toLocaleString()}원
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-green-50 border border-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wide">
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="divide-y divide-gray-50">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 hover:bg-white/60 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-md text-[10px] font-extrabold">
                          {item.credits}학점
                        </span>
                        <h3 className="text-sm font-bold text-[#111] truncate">
                          {item.course_name}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#666] font-medium">
                        <span className="flex items-center gap-1">
                          <User size={11} className="text-[#aaa]" />
                          {item.professor}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-[#aaa]" />
                          {item.schedule}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen size={11} className="text-[#aaa]" />
                          {item.grading}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-gray-400">수강가격</p>
                      <p className="text-sm font-extrabold text-[#111]">
                        {item.price.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white/40 border border-white/40 border-dashed border-2 backdrop-blur-md shadow-sm rounded-3xl p-16 text-center space-y-6 max-w-xl mx-auto mt-12">
          <div className="w-16 h-16 mx-auto bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 shadow-sm">
            <Package size={28} />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#111]">주문내역이 없습니다</h2>
            <p className="text-xs text-[#666] max-w-[280px] mx-auto leading-relaxed">
              장바구니에서 수강 신청을 완료하면 이곳에 내역이 표시됩니다.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#111] hover:bg-[#333] text-white text-xs font-bold rounded-xl transition-all shadow-md"
          >
            <ChevronLeft size={14} />
            교과목 보러 가기
          </Link>
        </div>
      )}
    </div>
  );
}
