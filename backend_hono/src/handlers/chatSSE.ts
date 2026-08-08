// server.ts (Hono 백엔드 예시)
import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { Context } from 'hono'

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const app = new Hono()
// 처음 배우는 개념이라 제미나이가 짜줌, 이해하고 흡수할 것
// 전역으로 관리할 이벤트 스트림 구독자 명단 (실제 서비스에선 더 고도화하지만 연습용으로!)
let sseStream: any = null

// 1. 프론트엔드가 이 통로를 통해 라디오 방송을 듣기 시작합니다.
export async function chatSSE_listen(c: Context) {
  return streamSSE(c, async (stream) => {
    sseStream = stream
    // 연결이 끊어질 때까지 대기 상태 유지
    while (true) {
      await stream.sleep(1000)
    }
  })
}

// 2. 사용자가 새로운 메시지를 보낼 때 호출하는 포스트 통로
export async function chatSSE_announcement(c: Context) {
  const { tempId, content } = await c.req.json()
  // 백엔드 데이터베이스에 저장되었다고 가정하고 정식 ID를 발행합니다.
  const realId = crypto.randomUUID() 
  // 라디오(SSE)를 듣고 있는 프론트엔드에게 "정식 번호 나왔다!"고 방송 보냅니다.
  if (sseStream) {
    await sseStream.writeSSE({
      data: JSON.stringify({ action: 'CONFIRM_ID', tempId, realId }),
      event: 'message'
    })
  }

  return c.json({ success: true })
}

export default app