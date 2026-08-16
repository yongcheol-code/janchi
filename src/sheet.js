import { CONFIG } from "./config.js";

// 항상 localStorage에 적립하고, 엔드포인트가 설정돼 있으면 함께 전송한다(no-cors라 응답은 못 읽음).
// rsvp-google-apps-script.gs 의 payload 계약: {type:'rsvp'|'guestbook'|'like'|'comment_like'|'comment_edit'|'comment_delete', ...}
export async function logAndSend(payload, storeKey) {
  if (storeKey) {
    try {
      const log = JSON.parse(localStorage.getItem(storeKey) || "[]");
      log.push(payload);
      localStorage.setItem(storeKey, JSON.stringify(log));
    } catch {
      // localStorage 접근 불가 (프라이빗 모드 등) — 무시하고 계속 진행
    }
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

// 방명록 전체 + 좋아요 카운터를 읽어온다. JSONP로 CORS 우회(POST의 no-cors와 별개 — GET 읽기 전용).
let jsonpCounter = 0;
export function fetchFeed() {
  return new Promise((resolve, reject) => {
    if (!CONFIG.rsvpEndpoint) {
      resolve(null);
      return;
    }
    const cb = `__wed_feed_${jsonpCounter++}`;
    const script = document.createElement("script");
    const cleanup = () => {
      delete window[cb];
      script.remove();
    };
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("fetchFeed timeout"));
    }, 8000);

    window[cb] = (data) => {
      clearTimeout(timeout);
      cleanup();
      resolve(data);
    };

    script.src = `${CONFIG.rsvpEndpoint}?callback=${cb}`;
    script.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      reject(new Error("fetchFeed load error"));
    };
    document.body.appendChild(script);
  });
}
