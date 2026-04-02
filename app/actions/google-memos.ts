"use server";

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL;

if (!GAS_URL) {
  console.warn("NEXT_PUBLIC_GAS_URL is not defined in .env.local");
}

interface MemoData {
  id: string;
  datetime: string;
  category: string;
  content: string;
  color: string;
}

export async function createMemoAction(memo: MemoData) {
  try {
    const response = await fetch(GAS_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", payload: memo }),
    });
    
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("GAS JSON Parse Error (Create). Response was:", text.substring(0, 100));
      return { success: false, error: "구글 시트 응답이 올바르지 않습니다 (JSON 아님)" };
    }
  } catch (err: any) {
    console.error("GAS CREATE ERROR:", err.message);
    return { success: false, error: err.message };
  }
}

export async function fetchMemosAction() {
  try {
    const response = await fetch(GAS_URL!, {
      method: "GET",
      cache: "no-store",
    });
    
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("GAS JSON Parse Error (Fetch). Response was:", text.substring(0, 100));
      return [];
    }
  } catch (err: any) {
    console.error("GAS FETCH ERROR:", err.message);
    return [];
  }
}

export async function updateMemoAction(memo: MemoData) {
  try {
    const response = await fetch(GAS_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", payload: memo }),
    });
    
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("GAS JSON Parse Error (Update). Response was:", text.substring(0, 100));
      return { success: false, error: "JSON 파싱 실패" };
    }
  } catch (err: any) {
    console.error("GAS UPDATE ERROR:", err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteMemoAction(id: string) {
  try {
    const response = await fetch(GAS_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", payload: { id } }),
    });
    
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("GAS JSON Parse Error (Delete). Response was:", text.substring(0, 100));
      return { success: false, error: "JSON 파싱 실패" };
    }
  } catch (err: any) {
    console.error("GAS DELETE ERROR:", err.message);
    return { success: false, error: err.message };
  }
}

export async function reorderMemosAction(memos: MemoData[]) {
  try {
    const response = await fetch(GAS_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder", payload: memos }),
    });
    
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("GAS JSON Parse Error (Reorder). Response was:", text.substring(0, 100));
      return { success: false, error: "JSON 파싱 실패" };
    }
  } catch (err: any) {
    console.error("GAS REORDER ERROR:", err.message);
    return { success: false, error: err.message };
  }
}
