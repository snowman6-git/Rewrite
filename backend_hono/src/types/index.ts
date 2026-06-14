export interface ModelInfo {
  id: string;
  status?: {
    value: string;
  };
}

export interface ChatInfo {
  sender: string;
  content: string;
}