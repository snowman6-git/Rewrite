// 1. 데이터 타입 정의
interface ModelStatus {
  value: string;
  args: string[];
  preset: string;
}

interface ModelData {
  id: string;
  status: ModelStatus;
  // 필요한 다른 필드들은 우선 생략 가능
}

// 제공해주신 데이터를 변수에 할당 (배열 형태이므로 첫 번째 요소 사용)
const dataList: ModelData[] = [
  {
    "id": "Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced-Q5_K_P",
    "status": {
      "value": "unloaded",
      "args": [
        "/home/snowman6/A-Cargo/Tools/llama.cpp/build/bin/llama-server",
        "--host", "127.0.0.1", "--jinja", "--port", "33087",
        "--alias", "Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced-Q5_K_P",
        "--ctx-size", "32768", "--flash-attn", "on",
        "--model", "/home/snowman6/A-Cargo/M-Storage/llm_models/Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced-Q5_K_P.gguf",
        "--n-gpu-layers", "999", "--parallel", "1", "--reasoning", "on"
      ],
      "preset": "[Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced-Q5_K_P]\njinja = 1\nctx-size = 32768\nflash-attn = on\nmodel = /home/snowman6/A-Cargo/M-Storage/llm_models/Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced-Q5_K_P.gguf\nn-gpu-layers = 999\nparallel = 1\nreasoning = on\n\n"
    }
  }
];

const targetData = dataList[0];

// --- 추출 방법 1: args 배열에서 추출하기 (가장 확실하고 추천하는 방법) ---
function getCtxSizeFromArgs(args: string[]): number | null {
  const index = args.indexOf("--ctx-size");
  if (index !== -1 && index + 1 < args.length) {
    const value = parseInt(args[index + 1], 10);
    return isNaN(value) ? null : value;
  }
  return null;
}

// --- 추출 방법 2: preset 텍스트에서 정규식으로 추출하기 ---
function getCtxSizeFromPreset(preset: string): number | null {
  const match = preset.match(/ctx-size\s*=\s*(\d+)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}

// 결과 출력
const ctxSizeFromArgs = getCtxSizeFromArgs(targetData.status.args);
console.log("Args에서 추출한 결과:", ctxSizeFromArgs); // 출력: 32768

const ctxSizeFromPreset = getCtxSizeFromPreset(targetData.status.preset);
console.log("Preset에서 추출한 결과:", ctxSizeFromPreset); // 출력: 32768