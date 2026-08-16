import { defineConfig } from "vite";

// GitHub Pages 프로젝트 사이트는 /<repo-name>/ 하위 경로에서 서빙되므로 base를 맞춰준다.
export default defineConfig({
  base: "/janchi/",
});
