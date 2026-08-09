// Tauri doesn't have a Node.js server to do proper SSR
// so we use adapter-static with a fallback to index.html to put the site in SPA mode
// See: https://svelte.dev/docs/kit/single-page-apps
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
// 타우리는 꺼야함 (서버가 없는데 서사레를 어캐하죠?)
export const ssr = false;
import "../app.css"