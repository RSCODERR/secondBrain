// Uses VITE_BACKEND_URL if specified in .env, otherwise automatically switches:
// - http://localhost:3000 in local dev (npm run dev)
// - https://secondbrain-pur4.onrender.com in production (npm run build)
export const BACKEND_URL: string =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.DEV
    ? "http://localhost:3000"
    : "https://secondbrain-pur4.onrender.com");
