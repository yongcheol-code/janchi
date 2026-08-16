import { CONFIG } from "./config.js";

// 항상 localStorage에 적립하고, 엔드포인트가 설정돼 있으면 함께 전송한다(no-cors라 응답은 못 읽음).
// rsvp-google-apps-script.gs 의 payload 계약: {type:'rsvp',...} / {type:'guestbook',...}
export async function logAndSend(payload, storeKey) {
  try {
    const log = JSON.parse(localStorage.getItem(storeKey) || "[]");
    log.push(payload);
    localStorage.setItem(storeKey, JSON.stringify(log));
  } catch {
    // localStorage 접근 불가 (프라이빗 모드 등) — 무시하고 계속 진행
  }

  if (!CONFIG.rsvpEndpoint) return;
  try {
    await fetch(CONFIG.rsvpEndpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  } catch {
    // no-cors라 실패해도 감지 불가 — 로컬 로그는 이미 남았으니 재제출 시 확인 가능
  }
}
