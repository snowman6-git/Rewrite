export interface ModelInfo {
  id: string;
  status?: {
    value: string;
  };
}
export interface BookStruct {
  id?: string;
  title: any;
  desc: any;
  starting?: []
}
export interface ChatInfo {
  sender: string;
  content: string;
}

export interface ResChunk {
  stream_n: number
  content: string
  input: number
  output: number
}