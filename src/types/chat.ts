export interface Source {
  page_number: string;
  section: string;
  content: string;
}

export interface AIResponseMetadata {
  confidence: number;
  response_type: string;
  sources: Source[];
}

export interface AIMessage {
  id: string;
  content: string;
  sender: 'assistant';
  timestamp: Date;
  chatSessionId: string;
  metadata?: AIResponseMetadata;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  chatSessionId: string;
  aiResponse?: AIMessage;
}

export interface ChatSession {
  id: string;
  title: string;
  userId: string;
  lastMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatHistory {
  session: ChatSession;
  messages: Message[];
} 