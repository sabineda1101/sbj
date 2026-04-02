"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Pencil, Check, X, GripVertical, Sun, Moon, Filter, ChevronDown, ListFilter, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createMemoAction,
  fetchMemosAction,
  updateMemoAction,
  deleteMemoAction,
  reorderMemosAction,
} from "@/app/actions/google-memos";

interface Memo {
  id: string;
  text: string;
  createdAt: Date;
  rotation: number;
  color: string;
  category: "할 일" | "아이디어" | "기타";
}

const CATEGORIES = ["할 일", "아이디어", "기타"] as const;
type Category = typeof CATEGORIES[number];

const POSTIT_COLORS = [
  "bg-yellow-200",   // 노란색
  "bg-rose-200",     // 분홍색
  "bg-emerald-200",  // 초록색
];

function SortableMemo({ 
  memo, 
  onDelete, 
  onEdit, 
  isEditing, 
  editingValue, 
  setEditingValue, 
  saveEdit, 
  cancelEdit 
}: { 
  memo: Memo;
  onDelete: (id: string) => void;
  onEdit: (memo: Memo) => void;
  isEditing: boolean;
  editingValue: string;
  setEditingValue: (val: string) => void;
  saveEdit: () => void;
  cancelEdit: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: memo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="h-full">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1, rotate: isDragging ? 0 : memo.rotation }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="relative group h-full"
      >
        <Card className={`aspect-square ${memo.color} border-none ring-0 py-0 shadow-[5px_5px_15px_rgba(0,0,0,0.06)] transition-all hover:shadow-[10px_10px_20px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden`}>
          <div 
            {...attributes} 
            {...listeners} 
            className="h-6 w-full bg-black/5 cursor-grab active:cursor-grabbing hover:bg-black/10 transition-colors flex items-center justify-center shadow-sm"
            title="드래그하여 이동"
          >
            <GripVertical className="h-3 w-3 text-black/20" />
          </div>
          <CardContent className="flex-1 p-6 relative flex flex-col">
            {isEditing ? (
              <div className="flex-1 flex flex-col h-full">
                <textarea
                  autoFocus
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      saveEdit();
                    }
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="flex-1 w-full bg-black/5 rounded-lg p-2 text-lg font-medium text-zinc-900 outline-none focus:bg-black/10 resize-none transition-all"
                  placeholder="메모를 수정하세요..."
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <Button onClick={saveEdit} size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-3 shadow-md">
                    저장
                  </Button>
                  <Button onClick={cancelEdit} size="sm" variant="secondary" className="h-8 rounded-full px-3 text-xs shadow-md">
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="flex-1 text-lg font-medium text-zinc-800 leading-relaxed overflow-hidden break-words pointer-events-none">
                  {memo.text}
                </p>
                <div className="absolute bottom-4 right-4 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    onClick={() => onEdit(memo)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-zinc-600 bg-white/60 hover:bg-white hover:text-black rounded-full shadow-sm border border-black/5"
                    title="편집"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => onDelete(memo.id)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-zinc-600 bg-white/60 hover:bg-red-100 hover:text-red-600 rounded-full shadow-sm border border-black/5"
                    title="삭제"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            )}
            <span className="absolute bottom-4 left-6 text-[9px] text-zinc-600/60 font-medium leading-tight select-none flex flex-col space-y-1">
              <span className="bg-black/5 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold text-[8px] w-fit">
                {memo.category}
              </span>
              <span>
                {memo.createdAt.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  weekday: "short",
                }).replace(/\. /g, ".")} {memo.createdAt.toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
            </span>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [inputCategory, setInputCategory] = useState<Category>("할 일");
  const [filterCategory, setFilterCategory] = useState<Category | "전체">("전체");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);

  // 테마 초기화
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark") || 
                   localStorage.getItem("postit_theme") === "dark";
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("postit_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("postit_theme", "light");
    }
  };

  // 초기 로드: 구글 시트에서 가져오기
  useEffect(() => {
    const loadMemos = async () => {
      setIsSyncing(true);
      const data = await fetchMemosAction();
      if (data && data.length > 0) {
        setMemos(data.map((m: any) => ({
          id: m.id,
          text: m.content,
          createdAt: new Date(m.datetime),
          category: m.category as Category,
          color: m.color,
          rotation: Math.random() * 4 - 2, // 템포러리 회전 (시트에 저장 안했을 경우)
        })));
      }
      setIsLoaded(true);
      setIsSyncing(false);
    };
    loadMemos();
  }, []);

  const addMemo = async () => {
    if (!inputValue.trim()) return;
    
    setIsSyncing(true);
    const lastColor = memos.length > 0 ? memos[0].color : null;
    const availableColors = lastColor 
      ? POSTIT_COLORS.filter(color => color !== lastColor)
      : POSTIT_COLORS;
      
    const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];

    const id = Math.random().toString(36).substring(2, 9);
    const now = new Date();
    const newMemo: Memo = {
      id,
      text: inputValue,
      createdAt: now,
      rotation: Math.random() * 4 - 2,
      color: randomColor,
      category: inputCategory,
    };
    
    // 🎨 낙관적 UI 업데이트: 시트 저장이 완료되기 전에 먼저 화면에 표시 (UX 향상)
    const prevMemos = [...memos];
    setMemos([newMemo, ...memos]);
    setInputValue("");

    try {
      // 📊 시트 동기화 (비동기)
      const result = await createMemoAction({
        id,
        datetime: now.toLocaleString("sv-SE"), // YYYY-MM-DD HH:mm:ss
        category: inputCategory,
        content: inputValue,
        color: randomColor,
      });

      if (!result?.success) {
        throw new Error(result?.error || "시트 저장 실패");
      }
      console.log("구글 시트 저장 성공!");
    } catch (err: any) {
      console.error("구글 시트 저장 에러:", err.message);
      // 실패 시 롤백 (선택 사항: 사용자에게 알림 후 롤백)
      // setMemos(prevMemos);
      alert(`메모 저장 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteMemo = async (id: string) => {
    setIsSyncing(true);
    await deleteMemoAction(id);
    setMemos(memos.filter((memo) => memo.id !== id));
    setIsSyncing(false);
  };

  const startEditing = (memo: Memo) => {
    setEditingId(memo.id);
    setEditingValue(memo.text);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setIsSyncing(true);
    
    const memoToUpdate = memos.find(m => m.id === editingId);
    if (memoToUpdate) {
      await updateMemoAction({
        id: editingId,
        datetime: memoToUpdate.createdAt.toLocaleString("sv-SE"),
        category: memoToUpdate.category,
        content: editingValue,
        color: memoToUpdate.color,
      });

      setMemos(memos.map(memo => 
        memo.id === editingId ? { ...memo, text: editingValue } : memo
      ));
    }
    setEditingId(null);
    setIsSyncing(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = memos.findIndex((i) => i.id === active.id);
      const newIndex = memos.findIndex((i) => i.id === over.id);
      const newItems = arrayMove(memos, oldIndex, newIndex);
      
      setMemos(newItems);
      
      // 시트 전체 업데이트 (순서 동기화)
      setIsSyncing(true);
      await reorderMemosAction(newItems.map(m => ({
        id: m.id,
        datetime: m.createdAt.toLocaleString("sv-SE"),
        category: m.category,
        content: m.text,
        color: m.color,
      })));
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 p-8 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="fixed top-8 right-8 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full w-12 h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-md hover:scale-110 active:scale-95 transition-all"
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-zinc-700" />}
          </Button>
        </div>

        <header className="text-center space-y-4 relative">
          {isSyncing && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 text-xs font-medium text-emerald-500 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>구글 시트 동기화 중...</span>
            </div>
          )}
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-serif">
            디지털 포스트잇
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            생각의 위치를 자유롭게 바꾸어 보세요. (3x3 정렬)
          </p>
          <div className="flex justify-center">
            <a 
              href="https://docs.google.com/spreadsheets/d/1HQHxrqBQjNa6leaTjQ2SKtp1aPP410YZUdCMePy_5Fw/edit?usp=sharing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-xs font-medium text-zinc-400 hover:text-emerald-500 transition-colors py-1 px-3 rounded-full bg-zinc-100/50 dark:bg-zinc-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
            >
              <ExternalLink className="h-3 w-3" />
              <span>연동된 구글 시트 데이터 확인기</span>
            </a>
          </div>
        </header>

        <div className="flex flex-col sm:flex-row w-full max-w-xl mx-auto items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Select value={inputCategory} onValueChange={(val: Category) => setInputCategory(val)}>
            <SelectTrigger className="w-[120px] h-12 shadow-sm focus:ring-emerald-400">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="text"
            placeholder="새로운 생각을 메모해보세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMemo()}
            className="h-12 flex-1 px-4 shadow-sm border-zinc-200 focus-visible:ring-emerald-400"
          />
          <Button 
            onClick={addMemo}
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md transition-all active:scale-95 px-6"
          >
            <Plus className="mr-2 h-5 w-5" /> 메모 추가
          </Button>
        </div>

        <div className="flex justify-between items-center px-2">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest flex items-center">
            <ListFilter className="h-4 w-4 mr-2" />
            메모 목록: {filterCategory}
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-emerald-500">
                <Filter className="h-4 w-4 mr-2" />
                필터: {filterCategory}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterCategory("전체")}>전체</DropdownMenuItem>
              {CATEGORIES.map((cat) => (
                <DropdownMenuItem key={cat} onClick={() => setFilterCategory(cat)}>
                  {cat}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={memos.map(m => m.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
              <AnimatePresence mode="popLayout" initial={false}>
                {memos
                  .filter(m => filterCategory === "전체" || m.category === filterCategory)
                  .map((memo) => (
                  <SortableMemo
                    key={memo.id}
                    memo={memo}
                    onDelete={deleteMemo}
                    onEdit={startEditing}
                    isEditing={editingId === memo.id}
                    editingValue={editingValue}
                    setEditingValue={setEditingValue}
                    saveEdit={saveEdit}
                    cancelEdit={cancelEdit}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>

        {memos.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block p-12 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-400 dark:text-zinc-600 font-medium">
                작성된 메모가 없습니다. 위에서 첫 메모를 남겨보세요!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
