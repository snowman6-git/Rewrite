import type { Context, Next } from "hono";

// 미들웨어란?
// 다른 라우터에 요청전 거쳐가며 인증의 유효함을 검증하는 중간자
// 익숙한 비유로는 
// VPN(홈서버에서 서빙중인 민감한 것들 로컬로 두고 VPN하나로 전부 들가기)
// 로드밸런서/NGINX(다른곳에 요청하기 전에 거쳐가는 중간자)
// 어차피 너 아는거 없으니까 이걸로 이해하는게 빠름

export async function authMiddleware(c: Context, next: Next) {
  const session = c.get("session");
  
  if (!session || !session.get("authenticated")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
}