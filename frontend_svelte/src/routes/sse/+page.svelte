<script lang="ts">
  import { onMount } from 'svelte';

  // 메시지 한 칸의 규칙 정의
  interface Message {
    id: string;       // 처음엔 임시 ID, 나중엔 정식 ID로 바뀜
    content: string;
    isConfirmed: boolean; // 서버가 승인해줬는지 여부 (화면에 흐리게 표시하는 용도)
  }

  // Svelte 5 최신 $state 주머니
  let messages = $state<Message[]>([]);
  let userInput = $state('');

  // 컴포넌트가 켜지면(onMount) 백엔드 라디오(SSE) 채널을 맞춥니다.
  onMount(() => {
    // 백엔드의 SSE 채널 개방
    const eventSource = new EventSource('http://localhost:3000/api/chat/stream');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // 만약 방송 내용이 "아이디 확정" 신호라면?
      if (data.action === 'CONFIRM_ID') {
        // 기존 주머니(messages)에서 임시 ID가 똑같은 녀석을 찾아서 정보를 업데이트합니다!
        messages = messages.map(msg => {
          if (msg.id === data.tempId) {
            return {
              ...msg,
              id: data.realId,       // 임시 ID를 백엔드가 준 정식 ID로 전격 교체!
              isConfirmed: true      // 이제 정식 등록되었다고 표시!
            };
          }
          return msg;
        });
      }
    };

    // 컴포넌트가 사라질 때 라디오 끄기 (메모리 누수 방지)
    return () => {
      eventSource.close();
    };
  });

  // 메시지 전송 버튼을 눌렀을 때
  async function sendMessage() {
    if (!userInput.trim()) return;

    // 1. 프론트엔드에서 고유한 임시 ID를 먼저 만듭니다. (예: temp-랜덤값)
    const tempId = `temp-${crypto.randomUUID()}`;
    const newMsg: Message = {
      id: tempId,
      content: userInput,
      isConfirmed: false // 아직 서버가 검토 중이므로 false
    };

    // 2. 백엔드한테 물어보지도 않고 일단 화면 주머니에 슉 집어넣기! (즉시 반영됨)
    messages.push(newMsg);
    const textToSend = userInput;
    userInput = ''; // 입력창 비우기

    // 3. 이제 백엔드 주방에 "이 임시 ID로 주문 넣었습니다!" 하고 요청을 보냅니다.
    await fetch('http://localhost:3000/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempId, content: textToSend })
    });
  }
</script>

<div class="chat-container">
  {#each messages as msg (msg.id)}
    <div class="message-bubble" class:pending={!msg.isConfirmed}>
      <p>{msg.content}</p>
      <span class="id-tag">
        {msg.isConfirmed ? '✓ 등록완료' : '⏳ 전송중...'} (ID: {msg.id.slice(0, 8)})
      </span>
    </div>
  {/each}
</div>

<div class="input-box">
  <input bind:value={userInput} onkeydown={(e) => e.key === 'Enter' && sendMessage()} placeholder="메시지를 입력하세요..." />
  <button onclick={sendMessage}>전송</button>
</div>

<style>
  .chat-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
    height: 400px;
    overflow-y: auto;
    border: 1px solid #ccc;
  }
  .message-bubble {
    padding: 10px;
    background-color: #e9e9e9;
    border-radius: 8px;
    max-width: 70%;
    align-self: flex-end; /* 내가 보낸 메시지 우측 정렬 */
    transition: all 0.3s ease;
  }
  /* 서버가 아직 허락 안 해준 임시 상태일 때는 반투명하게 흐려지도록 효과를 줍니다! */
  .message-bubble.pending {
    opacity: 0.6;
    background-color: #ffe0b2; 
  }
  .id-tag {
    font-size: 0.75rem;
    color: #666;
    display: block;
    margin-top: 4px;
  }
  .input-box {
    margin-top: 10px;
    display: flex;
    gap: 5px;
  }
  input { flex: 1; padding: 10px; }
  button { padding: 10px 20px; }
</style>