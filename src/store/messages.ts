import { create } from "zustand";
import { v4 as uuidv4 } from 'uuid'; 
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
  isCode?: boolean;
}

interface MessageState {
  messages: Message[];
  addMessage: (message: Partial<Message>) => Message;
  input: string;
  setInput: (text: string) => void;
  isFocused: boolean;
  setIsFocused: (value: boolean) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  currentStreamingMessage: string | null,
  sendMessage: () => Promise<void>;
  handleAIResponse: (userMessage: string) => Promise<void>;
  latestAIMessageId: string | null;
  setLatestAIMessageId: (id: string | null) => void;
  sendToGeminiStream: (userMessage: string) => Promise<void>
}
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
const useMessageStore = create<MessageState>((set, get) => ({
  
  sendToGeminiStream: async  (
    userMessage: string,
  ) => {
  
  
    // Create an initial empty AI message
    const aiMessageId = Date.now() + 1 + '';
    set((state) => ({
      messages: [...state.messages, {
        id: aiMessageId,
        text: '',
        sender: 'ai',
        timestamp: new Date()
      }],
      currentStreamingMessage: aiMessageId
    }));
  

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const responseStream = await model.generateContentStream(userMessage);
  
      for await (const chunk of responseStream.stream) {
        const textChunk = chunk.text();
        
        set((state) => {
          const updatedMessages = state.messages.map(msg => {
            if (msg.id === state.currentStreamingMessage) {
              return { ...msg, text: msg.text + textChunk };
            }
            return msg;
          });
          
          return { messages: updatedMessages };
        });
      }
    } catch (error) {
      console.error("Streaming error:", error);
      // Handle error - append error message
      set((state) => {
        const updatedMessages = state.messages.map(msg => {
          if (msg.id === state.currentStreamingMessage) {
            return { ...msg, text: "Error: Could not process your request." };
          }
          return msg;
        });
        
        return { messages: updatedMessages };
      });
    } finally {
      // Clear loading and streaming states
      set({ isLoading: false, currentStreamingMessage: null });
    }
  },
  messages: [],
  currentStreamingMessage: null,
  addMessage: (messageData: Partial<Message>) => {
    const message: Message = {
      id: messageData.id || uuidv4(),
      text: messageData.text || '',
      sender: messageData.sender || 'user',
      timestamp: messageData.timestamp || new Date(),
      isCode: messageData.isCode || false
    };
    set((state) => ({
      messages: [...state.messages, message]
    }));
    return message;
  },
  input: '',
  setInput: (text) => set({ input: text }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  isFocused: false,
  setIsFocused: (focused) => set({ isFocused: focused }),
  latestAIMessageId: null,
  setLatestAIMessageId: (id) => set({ latestAIMessageId: id }),

  sendMessage: async () => {
    const { input, setInput, handleAIResponse } = get();
    if (!input.trim()) return;

    const messageText = input;
    setInput('');
    await handleAIResponse(messageText);
  },

  handleAIResponse: async (userMessage: string) => {
    const { addMessage, setIsLoading, setLatestAIMessageId, sendToGeminiStream } = get();

    if (!userMessage.trim()) return;

    addMessage({
      sender: 'user',
      text: userMessage,
      isCode: false
    });

    setIsLoading(true);



    try {
      await sendToGeminiStream(userMessage)
    } catch (error) {
      console.error('AI Response Error:', error);
      addMessage({
        sender: 'ai',
        text: "Sorry, I encountered an error processing your request.",
        isCode: false
      });
      setIsLoading(false);
    }
  }
}));

export default useMessageStore;