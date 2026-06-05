<script lang="ts">
	import { logic_plus } from '../routes/book/api_options';
	import { chatState } from '$lib/states/chat.svelte';

</script>

<div id="chat_tools">
	<label id="logic_plus_label" class:active={chatState.logic_plus}>
		<div id="logic_plus_icon"></div>
		<button id="logic_plus_btn" onclick={() => (chatState.logic_plus = !chatState.logic_plus)}>Logic+</button>
	</label>
	<!-- 리턴이 없는 보이드 함수라 이런식 -->

	<!-- 유저인풋도 있고, 모델이 응답도 안할때 활성화  -->
	<button
		class:active={chatState.user_input.trim() !== '' && !chatState.isModelResponding}
		disabled={chatState.isModelResponding}
		title="send"
		id="send_btn"
		onclick={() => {chatState.sendMessage()}}
	></button>
</div>

<style>
	button,
	#logic_plus_icon {
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
	}
	#chat_tools {
		display: flex;
		width: 100%;
		color: white;
		display: flex;
		justify-content: space-between;
		/* border-top: 0.2rem solid gray; */
		padding-top: 0.5rem;
	}
	#logic_plus_label #logic_plus_btn {
		opacity: 0.5;
	}
	#logic_plus_label.active #logic_plus_btn {
		opacity: 1;
	}
	#logic_plus_label {
		width: 7rem;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding-right: 1.5rem;
		border: 0.15rem solid;
		border-color: grey;
		border-radius: 10rem;
	}
	#logic_plus_label.active {
		border-color: white;
	}

	#logic_plus_icon {
		width: auto;
		height: 100%;
		aspect-ratio: 1/1;
		background-size: 70%;
		background-image: url('../lib/assets/logic_plus.svg');
	}

	#send_btn {
		opacity: 0.5;
		width: 2.25rem;
		height: 2.25rem;
		border: 0.15rem solid white;
		border-radius: 100%;
		background-size: 70%;
		background-image: url('../lib/assets/pen.svg');
	}
	#send_btn.active {
		opacity: 1;
	}
</style>
