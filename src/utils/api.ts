import { Message, ChatSession } from '../types/chat';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:8000/api';

// Helper to get the JWT token from localStorage
const getAuthHeader = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return token 
    ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
};

// Helper to get auth headers without Content-Type for file uploads
const getAuthHeaderForFileUpload = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return token 
    ? { 'Authorization': `Bearer ${token}` }
    : {};
};

// Get all chat sessions for a user
export const getChatSessions = async (): Promise<ChatSession[]> => {
  const response = await fetch(`${API_BASE_URL}/chat-sessions`, {
    headers: getAuthHeader()
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - Please login again');
    }
    throw new Error('Failed to fetch chat sessions');
  }
  
  const sessions = await response.json();
  return sessions.map((session: any) => ({
    ...session,
    createdAt: new Date(session.createdAt),
    updatedAt: new Date(session.updatedAt)
  }));
};

// Get messages for a specific chat session
export const getMessages = async (chatSessionId: string): Promise<Message[]> => {
  const response = await fetch(`${API_BASE_URL}/messages?chat_session_id=${chatSessionId}`, {
    headers: getAuthHeader()
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - Please login again');
    }
    throw new Error('Failed to fetch messages');
  }
  
  const messages = await response.json();
  return messages.map((message: any) => ({
    ...message,
    timestamp: new Date(message.timestamp)
  }));
};

// Create a new chat session
export const createChatSession = async (
  session: Omit<ChatSession, 'createdAt' | 'updatedAt'>
): Promise<ChatSession> => {
  const response = await fetch(`${API_BASE_URL}/chat-sessions`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(session),
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - Please login again');
    }
    throw new Error('Failed to create chat session');
  }
  
  const newSession = await response.json();
  return {
    ...newSession,
    createdAt: new Date(newSession.createdAt),
    updatedAt: new Date(newSession.updatedAt)
  };
};

// Add a new message to a chat session
export const addMessage = async (message: Message): Promise<Message> => {
  const response = await fetch(`${API_BASE_URL}/messages`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(message),
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - Please login again');
    }
    throw new Error('Failed to add message');
  }
  
  const newMessage = await response.json();
  
  // Check if the response includes an aiResponse and return both the user message and AI message
  if (newMessage.aiResponse) {
    return {
      ...newMessage,
      timestamp: new Date(newMessage.timestamp),
      aiResponse: {
        ...newMessage.aiResponse,
        timestamp: new Date(newMessage.aiResponse.timestamp)
      }
    };
  }
  
  return {
    ...newMessage,
    timestamp: new Date(newMessage.timestamp)
  };
};

// Update a chat session's title
export const updateChatSessionTitle = async (
  sessionId: string,
  newTitle: string
): Promise<void> => {
  console.log('Updating chat session title:', { sessionId, newTitle });
  const response = await fetch(`${API_BASE_URL}/chat-sessions/${sessionId}`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify({ title: newTitle }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Failed to update chat session title:', errorData);
    if (response.status === 401) {
      throw new Error('Unauthorized - Please login again');
    }
    throw new Error('Failed to update chat session title');
  }
  console.log('Successfully updated chat session title');
};

// Delete a chat session and its messages
export const deleteChatSession = async (sessionId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/chat-sessions/${sessionId}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - Please login again');
    }
    throw new Error('Failed to delete chat session');
  }
};

// New function to directly query the RAG system
export interface RAGQueryParams {
  query: string;
  chatSessionId?: string;
}

export interface RAGSourceItem {
  page_number: string;
  section: string;
  content: string;
}

export interface RAGMetadata {
  originalQuery: string;
  refinedQuery: string;
  confidence: number;
  responseType: string;
  sources: RAGSourceItem[];
}

export interface RAGQueryResponse {
  response: string;
  metadata: RAGMetadata;
}

export const queryRAG = async (params: RAGQueryParams): Promise<RAGQueryResponse> => {
  const response = await fetch(`${API_BASE_URL}/rag-query`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - Please login again');
    }
    throw new Error('Failed to query RAG system');
  }
  
  return await response.json();
};

// Upload profile picture
export const uploadProfilePicture = async (file: File, userId: string): Promise<{ profilePictureUrl: string }> => {
  // Create a temporary client-side solution since the backend endpoint doesn't exist
  return new Promise((resolve, reject) => {
    try {
      // Check file size
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('File size exceeds 5MB limit'));
        return;
      }

      // Read the file as a data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target || typeof event.target.result !== 'string') {
          reject(new Error('Failed to read file'));
          return;
        }

        const dataUrl = event.target.result;
        
        // Store in localStorage with user-specific key
        const storageKey = `profile_picture_${userId}`;
        localStorage.setItem(storageKey, dataUrl);
        
        // Return the data URL as the profile picture URL
        resolve({ profilePictureUrl: dataUrl });
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
};

// Update user profile
export const updateUserProfile = async (profileData: Partial<{
  username: string;
  email: string;
  region: string;
}>): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify(profileData),
    credentials: 'include',
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - Please login again');
    }
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to update profile');
  }
  
  return await response.json();
}; 