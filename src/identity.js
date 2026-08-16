// 로그인 없이 "이 브라우저에서 쓴 글"만 구분하기 위한 로컬 식별자.
// ownerToken은 서버에 저장돼 수정/삭제 요청 시 본인 확인에 쓰인다(화면에는 노출 안 됨).
const TOKEN_KEY = "wed-owner-token";
const MINE_KEY = "wed-my-comments";
const COUPLE_KEY = "wed-couple-verified";

export function getOwnerToken() {
  try {
    let token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      token = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(TOKEN_KEY, token);
    }
    return token;
  } catch {
    return "anon";
  }
}

export function getMyCommentIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(MINE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export function rememberMyComment(id) {
  try {
    const ids = getMyCommentIds();
    ids.add(id);
    localStorage.setItem(MINE_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage 접근 불가 — 무시
  }
}

export function forgetMyComment(id) {
  try {
    const ids = getMyCommentIds();
    ids.delete(id);
    localStorage.setItem(MINE_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage 접근 불가 — 무시
  }
}

export function newCommentId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// 답글 버튼은 방문자 전체가 아니라, 비밀코드를 한 번 확인한 "이 기기"에서만 보이게 한다.
export function isCoupleVerified() {
  try {
    return localStorage.getItem(COUPLE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setCoupleVerified() {
  try {
    localStorage.setItem(COUPLE_KEY, "1");
  } catch {
    // localStorage 접근 불가 — 무시(이 세션 동안은 노출 안 됨)
  }
}
