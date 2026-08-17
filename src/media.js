import { MEDIA_BASE } from "./config.js";

const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

// 사진·영상이 없으면 placeholder 문구를 보여준다 (아직 준비 안 된 상태 = 정상).
// 파일명 확장자로 이미지/영상을 구분한다. 영상은 활성 슬라이드일 때만 재생하도록
// IntersectionObserver(threshold 0.6)로 제어한다.
export function mediaSlot(filename, placeholderText, priority = false) {
  const wrap = document.createElement("div");
  wrap.className = "media-slot";
  if (!filename) {
    wrap.appendChild(placeholder(placeholderText));
    return wrap;
  }

  if (VIDEO_EXT.test(filename)) {
    const video = document.createElement("video");
    video.className = "media-fill";
    video.src = MEDIA_BASE + filename;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.addEventListener("error", () => {
      video.remove();
      wrap.appendChild(placeholder(placeholderText));
    });
    wrap.appendChild(video);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: [0, 0.6, 1] }
    );
    observer.observe(wrap);
    return wrap;
  }

  const img = document.createElement("img");
  img.className = "media-fill";
  img.src = MEDIA_BASE + filename;
  img.alt = "";
  if (priority) {
    img.loading = "eager";
    img.fetchPriority = "high";
    // 첫 사진이 늦게 뜨는 동안 아래쪽(캘린더 등)이 먼저 보이는 경우가 있어,
    // 로딩이 끝나면 피드를 다시 맨 위로 고정한다.
    img.addEventListener("load", () => {
      document.querySelector(".wed-feed")?.scrollTo(0, 0);
    });
  } else {
    img.loading = "lazy";
  }
  img.addEventListener("error", () => {
    img.remove();
    wrap.appendChild(placeholder(placeholderText));
  });
  wrap.appendChild(img);
  return wrap;
}

function placeholder(text) {
  const el = document.createElement("div");
  el.className = "media-placeholder";
  el.textContent = text ?? "사진 준비중";
  return el;
}
